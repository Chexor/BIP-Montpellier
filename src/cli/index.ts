#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
import {
  loadMedications,
  loadPillboxStatus,
  savePillboxStatus,
  loadScheduleAndLogs,
  saveScheduleAndLogs,
  fillCompartment,
  notifyServerEvent,
  resetAllData,
} from '../utils/storage.js';

const program = new Command();

program
  .name('dosette-cli')
  .description('Dosette Smart Pillbox & AI Companion Simulator CLI')
  .version('1.0.0');

// 1. scan-pack <barcode>
program
  .command('scan-pack')
  .argument('<barcode>', 'Barcode of the medication packaging (e.g. 3400930000001)')
  .description('Simulate scanning a medication box and output plain-language AI explanation')
  .action((barcode: string) => {
    console.log(pc.bold(pc.cyan('\n📱 [VISION / OCR SCANNER] Scanning medication packaging...')));
    console.log(pc.dim(`Detected barcode: ${barcode}`));

    const medications = loadMedications();
    const med = medications.find((m) => m.barcode === barcode.trim());

    if (!med) {
      console.log(pc.bold(pc.red(`\n❌ No medication found for barcode: ${barcode}`)));
      console.log(pc.yellow('Available barcodes in catalog:'));
      for (const m of medications) {
        console.log(` - ${pc.bold(m.barcode)}: ${m.brand_name} (${m.generic_name})`);
      }
      return;
    }

    const pillbox = loadPillboxStatus();
    const assignedCompartment = pillbox.compartments.find(
      (c) => c.medication_id === med.id
    );

    console.log(pc.green(pc.bold('\n✅ Medication successfully recognized!\n')));
    console.log(`${pc.bold('Brand Name:')}     ${pc.white(pc.bold(med.brand_name))} (${pc.italic(med.generic_name)})`);
    console.log(`${pc.bold('Dosage:')}         ${med.dosage}`);
    console.log(`${pc.bold('Appearance:')}     ${med.color}, ${med.shape}`);

    console.log('\n' + pc.bold(pc.bgCyan(pc.black(' 🤖 AI COMPANION — PLAIN-LANGUAGE SUMMARY '))) + '\n');
    console.log(`${pc.bold('Purpose:')}        ${pc.green(med.ai_explanation.summary)}`);
    console.log(`${pc.bold('Instructions:')}   ${med.ai_explanation.simple_instructions}`);
    console.log(`${pc.bold('Warnings:')}       ${pc.yellow(med.ai_explanation.warnings)}`);

    if (assignedCompartment) {
      console.log('\n' + pc.bold(pc.bgMagenta(pc.white(' 💊 SMART PILLBOX SYNC '))) + '\n');
      console.log(`👉 Place pill in ${pc.bold(pc.cyan(`Compartment ${assignedCompartment.compartment_index}`))} [${assignedCompartment.label}]`);
    } else {
      console.log(pc.dim('\nℹ️ No fixed compartment assigned in pillbox_status.json'));
    }

    console.log(pc.dim('\n[Audio TTS preview: "This is ' + med.brand_name + '. ' + med.ai_explanation.summary + '"]\n'));
  });

// 2. open-compartment <index>
program
  .command('open-compartment')
  .argument('<index>', 'Compartment index (e.g. 1, 2, or 3)')
  .description('Simulate patient opening a compartment lid on the smart pillbox')
  .action((indexArg: string) => {
    const compIndex = parseInt(indexArg, 10);
    if (isNaN(compIndex)) {
      console.log(pc.red('Error: Please enter a valid compartment number (e.g. 1, 2, or 3).'));
      return;
    }

    console.log(pc.bold(pc.cyan(`\n🔓 [HARDWARE EVENT] Opening Compartment ${compIndex} lid...`)));

    const pillbox = loadPillboxStatus();
    const compartment = pillbox.compartments.find((c) => c.compartment_index === compIndex);

    if (!compartment) {
      console.log(pc.red(`❌ Compartment ${compIndex} does not exist on this device.`));
      return;
    }

    const medications = loadMedications();
    const med = medications.find((m) => m.id === compartment.medication_id);
    const medName = med ? med.brand_name : (compartment.medication_id || 'Unknown medication');

    const hadPills = compartment.pills_count > 0;

    // Update pillbox status
    compartment.state = 'TAKEN';
    compartment.pills_count = 0;
    compartment.led_active = false;
    pillbox.last_synced = new Date().toISOString();
    savePillboxStatus(pillbox);

    // Update logs
    const schedule = loadScheduleAndLogs();
    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const existingLog = schedule.intake_logs.find(
      (log) => log.compartment_index === compIndex && log.status === 'PENDING'
    );

    if (existingLog) {
      existingLog.status = 'TAKEN_ON_TIME';
      existingLog.actual_time = nowIso;
      existingLog.caregiver_notified = true;
    } else {
      schedule.intake_logs.push({
        id: `log_${Date.now().toString().slice(-4)}`,
        scheduled_time: nowIso,
        actual_time: nowIso,
        compartment_index: compIndex,
        medication_name: medName,
        status: 'TAKEN_ON_TIME',
        caregiver_notified: true,
      });
    }

    saveScheduleAndLogs(schedule);

    // Notify companion app/server live
    void notifyServerEvent('data_updated', { type: 'OPEN', index: compIndex, medication: medName });

    console.log(pc.green(pc.bold(`\n✅ Sensor detection: Compartment ${compIndex} (${compartment.label}) emptied.`)));
    if (hadPills) {
      console.log(`💊 ${pc.bold(medName)} intake registered.`);
    } else {
      console.log(pc.yellow(`ℹ️ Compartment ${compIndex} was already empty, intake confirmed.`));
    }

    console.log(pc.bold('\n📱 [CAREGIVER NOTIFICATION DISPATCHED]'));
    console.log(pc.green(`✔️  SMS & Push notification sent to ${schedule.caregiver_contact}`));
    console.log(pc.dim(`   Message: "${schedule.patient_name} has taken ${medName} at ${nowTimeStr}."`));
    console.log(pc.cyan(`\n🔄 pillbox_status.json and schedule_and_logs.json updated.\n`));
  });

// 3. fill-compartment <index> [medication]
program
  .command('fill-compartment')
  .argument('<index>', 'Compartment index (e.g. 1, 2 or 3)')
  .argument('[medication]', 'Optional medication ID or barcode (e.g. med_001 or 3400930000001)')
  .description('Simulate caregiver refilling a compartment in the smart pillbox')
  .action((indexArg: string, medArg?: string) => {
    const compIndex = parseInt(indexArg, 10);
    if (isNaN(compIndex)) {
      console.log(pc.red('Error: Please enter a valid compartment number (e.g. 1, 2 or 3).'));
      return;
    }

    let resolvedMedId: string | undefined = undefined;
    if (medArg) {
      const medications = loadMedications();
      const match = medications.find(
        (m) => m.id === medArg.trim() || m.barcode === medArg.trim()
      );
      if (match) {
        resolvedMedId = match.id;
      } else {
        console.log(pc.yellow(`Warning: Medication "${medArg}" not found in catalog. Refilling compartment regardless.`));
      }
    }

    const result = fillCompartment(compIndex, resolvedMedId, 1);
    if (!result.success) {
      console.log(pc.red(`❌ ${result.message}`));
      return;
    }

    const comp = result.compartment;
    const medications = loadMedications();
    const med = medications.find((m) => m.id === comp?.medication_id);

    console.log(pc.green(pc.bold(`\n📥 [SMART PILLBOX] Compartment ${compIndex} successfully refilled!`)));
    console.log(`${pc.bold('Compartment:')} ${comp.label}`);
    console.log(`${pc.bold('Medication:')}  ${med ? med.brand_name : 'Assigned medication'}`);
    console.log(`${pc.bold('Pill Count:')}  ${comp.pills_count}`);
    console.log(`${pc.bold('Status:')}      ${pc.green('FILLED')}`);
    console.log(pc.cyan(`\n🔄 pillbox_status.json updated.\n`));
  });

// 4. trigger-alert <index>
program
  .command('trigger-alert')
  .argument('<index>', 'Compartment index (e.g. 1, 2, or 3)')
  .description('Simulate a missed dose after 30 minutes delay (>30m alert)')
  .action((indexArg: string) => {
    const compIndex = parseInt(indexArg, 10);
    if (isNaN(compIndex)) {
      console.log(pc.red('Error: Please enter a valid compartment number (e.g. 1, 2, or 3).'));
      return;
    }

    const pillbox = loadPillboxStatus();
    const compartment = pillbox.compartments.find((c) => c.compartment_index === compIndex);
    const schedule = loadScheduleAndLogs();

    const medications = loadMedications();
    const med = compartment ? medications.find((m) => m.id === compartment.medication_id) : null;
    const medName = med ? med.brand_name : (compartment?.medication_id || 'Medication');

    const scheduledTime = compartment ? compartment.target_time : 'unknown time';

    // Highlight alert in logs
    const existingLog = schedule.intake_logs.find(
      (log) => log.compartment_index === compIndex && log.status === 'PENDING'
    );

    if (existingLog) {
      existingLog.status = 'MISSED';
      existingLog.caregiver_notified = true;
    } else {
      schedule.intake_logs.push({
        id: `log_alert_${Date.now().toString().slice(-4)}`,
        scheduled_time: new Date().toISOString(),
        actual_time: null,
        compartment_index: compIndex,
        medication_name: medName,
        status: 'MISSED',
        caregiver_notified: true,
      });
    }
    saveScheduleAndLogs(schedule);

    // Activate LED on hardware simulation
    if (compartment) {
      compartment.led_active = true;
      savePillboxStatus(pillbox);
    }

    // Notify companion app/server live
    void notifyServerEvent('data_updated', { type: 'ALERT', index: compIndex, medication: medName });

    console.log('\n' + pc.bold(pc.bgRed(pc.white(' 🚨 ALERT: MISSED DOSE (>30 MIN LATE) '))) + '\n');
    console.log(pc.red(pc.bold(`⚠️  Patient ${schedule.patient_name} has missed their scheduled dose!`)));
    console.log(`${pc.bold('Compartment:')} Compartment ${compIndex} (${compartment?.label || 'N/A'})`);
    console.log(`${pc.bold('Medication:')}  ${medName}`);
    console.log(`${pc.bold('Scheduled:')}   ${scheduledTime}`);
    console.log(`${pc.bold('Hardware LED:')} ${pc.yellow('FLASHING RED 🔴')}`);

    console.log(pc.bold('\n📢 [AUTOMATIC CAREGIVER ESCALATION]'));
    console.log(pc.red(`📞 Urgent SMS / push dispatched to caregiver: ${schedule.caregiver_contact}`));
    console.log(pc.red(`🔔 Live SSE event sent to Dosette App [HTTP 200: PUSH_ALERT_DISPATCHED]`));
    console.log(pc.dim(`   Content: "Urgent: Jean Dupont has not taken ${medName} scheduled for ${scheduledTime}."\n`));
  });

// 5. status
program
  .command('status')
  .description('Display the current pillbox status, battery level, and recent intake logs')
  .action(() => {
    const pillbox = loadPillboxStatus();
    const schedule = loadScheduleAndLogs();
    const medications = loadMedications();

    console.log('\n' + pc.bold(pc.bgBlue(pc.white(` 📦 DOSETTE SMART PILLBOX — DEVICE TELEMETRY `))) + '\n');
    console.log(`${pc.bold('Device ID:')}    ${pillbox.device_id}`);
    console.log(`${pc.bold('Battery:')}      ${pillbox.battery_level > 20 ? pc.green(`${pillbox.battery_level}% 🔋`) : pc.red(`${pillbox.battery_level}% 🪫`)}`);
    console.log(`${pc.bold('Last Synced:')}  ${pillbox.last_synced}`);
    console.log(`${pc.bold('Patient:')}      ${schedule.patient_name}`);
    console.log(`${pc.bold('Caregiver:')}    ${schedule.caregiver_contact}`);

    console.log('\n' + pc.bold(pc.cyan('--- COMPARTMENTS ---')));
    for (const c of pillbox.compartments) {
      const med = medications.find((m) => m.id === c.medication_id);
      const stateBadge =
        c.state === 'FILLED'
          ? pc.green(' [FILLED] ')
          : c.state === 'TAKEN'
          ? pc.cyan(' [TAKEN] ')
          : pc.dim(' [EMPTY] ');

      const ledBadge = c.led_active ? pc.yellow('🔴 LED FLASHING') : pc.dim('⚪ LED OFF');

      console.log(
        `Box ${pc.bold(c.compartment_index.toString())} | ${c.label.padEnd(16)} | ${stateBadge} | Pills: ${c.pills_count} | ${
          med ? pc.white(med.brand_name) : pc.dim('No medication')
        } | ${ledBadge}`
      );
    }

    console.log('\n' + pc.bold(pc.cyan('--- RECENT INTAKE LOGS ---')));
    for (const log of schedule.intake_logs) {
      const statusBadge =
        log.status === 'TAKEN_ON_TIME'
          ? pc.green('✔ TAKEN ON TIME')
          : log.status === 'MISSED'
          ? pc.red('✖ MISSED (>30m)')
          : pc.yellow('⏳ PENDING');

      console.log(
        `• [${log.scheduled_time.slice(11, 16)}] Box ${log.compartment_index} - ${log.medication_name}: ${statusBadge} (Caregiver notified: ${
          log.caregiver_notified ? 'Yes' : 'No'
        })`
      );
    }
    console.log('');
  });

// 6. reset
program
  .command('reset')
  .description('Restore JSON databases to initial hackathon demo state')
  .action(() => {
    resetAllData();
    console.log(pc.green(pc.bold('\n🔄 All demo data restored to initial hackathon state!')));
    console.log(' - data/medications.json');
    console.log(' - data/pillbox_status.json');
    console.log(' - data/schedule_and_logs.json');
    console.log(' - data/inbox_messages.json\n');
  });

program.parse(process.argv);
