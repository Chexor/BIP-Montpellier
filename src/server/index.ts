import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadMedications,
  loadPillboxStatus,
  savePillboxStatus,
  loadScheduleAndLogs,
  saveScheduleAndLogs,
  fillCompartment,
  resetAllData,
  loadInboxMessages,
  addInboxMessage,
  markMessageRead,
} from '../utils/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const DATA_DIR = path.resolve(process.cwd(), 'data');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Set of connected SSE clients
const sseClients = new Set<http.ServerResponse>();

export function broadcastEvent(event: string, payload: unknown): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(message);
    } catch {
      sseClients.delete(res);
    }
  }
}

// Watch data files for external changes (e.g. from CLI or direct edits)
let debounceTimeout: NodeJS.Timeout | null = null;
if (fs.existsSync(DATA_DIR)) {
  fs.watch(DATA_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        broadcastEvent('data_updated', {
          source: 'file_watcher',
          file: filename,
          timestamp: new Date().toISOString(),
          status: {
            pillbox: loadPillboxStatus(),
            schedule: loadScheduleAndLogs(),
          },
        });
      }, 80);
    }
  });
}

function parseJsonBody<T = any>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : ({} as T));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --- API ROUTES ---

  // SSE Stream
  if (pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Internal notify from CLI
  if (pathname === '/api/internal/notify' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      broadcastEvent('data_updated', {
        source: 'cli',
        ...body,
        status: {
          pillbox: loadPillboxStatus(),
          schedule: loadScheduleAndLogs(),
        },
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    return;
  }

  // GET /api/status
  if (pathname === '/api/status' && req.method === 'GET') {
    const pillbox = loadPillboxStatus();
    const schedule = loadScheduleAndLogs();
    const medications = loadMedications();
    const messages = loadInboxMessages();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ pillbox, schedule, medications, messages }));
    return;
  }

  // GET /api/messages
  if (pathname === '/api/messages' && req.method === 'GET') {
    const role = parsedUrl.searchParams.get('role'); // 'PATIENT' | 'CAREGIVER'
    const allMessages = loadInboxMessages();
    const filtered = role ? allMessages.filter((m) => m.to === role || m.from === role) : allMessages;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filtered));
    return;
  }

  // POST /api/messages (send message between patient and caregiver)
  if (pathname === '/api/messages' && req.method === 'POST') {
    try {
      const { from, to, sender_name, title, content, type } = await parseJsonBody(req);
      if (!from || !to || !content) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields: from, to, content' }));
        return;
      }
      const msg = addInboxMessage({
        from,
        to,
        sender_name: sender_name || (from === 'CAREGIVER' ? 'Sophie (Mantelzorger)' : 'Jean (Patiënt)'),
        title: title || (from === 'CAREGIVER' ? 'Herinnering van Sophie' : 'Bericht van Jean'),
        content,
        type: type || 'REMINDER',
      });
      broadcastEvent('message_created', { message: msg });
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: msg }));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error sending message' }));
    }
    return;
  }

  // POST /api/messages/read
  if (pathname === '/api/messages/read' && req.method === 'POST') {
    try {
      const { id } = await parseJsonBody(req);
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing id parameter' }));
        return;
      }
      const ok = markMessageRead(id);
      broadcastEvent('message_read', { id });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: ok }));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error marking message read' }));
    }
    return;
  }

  // GET /api/medications
  if (pathname === '/api/medications' && req.method === 'GET') {
    const medications = loadMedications();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(medications));
    return;
  }

  // POST /api/scan
  if (pathname === '/api/scan' && req.method === 'POST') {
    try {
      const { barcode } = await parseJsonBody(req);
      if (!barcode) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Barcode parameter is required' }));
        return;
      }

      const medications = loadMedications();
      const med = medications.find((m) => m.barcode === String(barcode).trim());

      if (!med) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Geen medicijn gevonden voor barcode ${barcode}` }));
        return;
      }

      const pillbox = loadPillboxStatus();
      const compartment = pillbox.compartments.find((c) => c.medication_id === med.id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          medication: med,
          assigned_compartment: compartment || null,
        })
      );
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error processing scan' }));
    }
    return;
  }

  // POST /api/open (simulate compartment lid opened)
  if (pathname === '/api/open' && req.method === 'POST') {
    try {
      const { compartment_index } = await parseJsonBody(req);
      const index = parseInt(compartment_index, 10);
      const pillbox = loadPillboxStatus();
      const comp = pillbox.compartments.find((c) => c.compartment_index === index);

      if (!comp) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Vakje ${index} niet gevonden` }));
        return;
      }

      const medications = loadMedications();
      const med = medications.find((m) => m.id === comp.medication_id);
      const medName = med ? med.brand_name : (comp.medication_id || 'Medicijn');

      // Update pillbox
      comp.state = 'TAKEN';
      comp.pills_count = 0;
      comp.led_active = false;
      pillbox.last_synced = new Date().toISOString();
      savePillboxStatus(pillbox);

      // Update logs
      const schedule = loadScheduleAndLogs();
      const nowIso = new Date().toISOString();

      const existingLog = schedule.intake_logs.find(
        (log) => log.compartment_index === index && log.status === 'PENDING'
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
          compartment_index: index,
          medication_name: medName,
          status: 'TAKEN_ON_TIME',
          caregiver_notified: true,
        });
      }

      saveScheduleAndLogs(schedule);

      // Automated inbox notification for caregiver
      addInboxMessage({
        from: 'SYSTEM_PILLBOX',
        to: 'CAREGIVER',
        sender_name: 'Dosette Smart Pillbox',
        title: 'Medication Taken on Time',
        content: `${schedule.patient_name} opened Compartment ${index} (${comp.label}) and took ${medName} on schedule.`,
        type: 'CONFIRMATION',
        medication_name: medName,
        compartment_index: index,
      });

      broadcastEvent('data_updated', {
        type: 'OPEN',
        index,
        medication: medName,
        status: { pillbox, schedule },
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, pillbox, schedule }));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error opening compartment' }));
    }
    return;
  }

  // POST /api/fill (simulate filling compartment)
  if (pathname === '/api/fill' && req.method === 'POST') {
    try {
      const { compartment_index, medication_id } = await parseJsonBody(req);
      const index = parseInt(compartment_index, 10);
      const result = fillCompartment(index, medication_id, 1);

      if (!result.success) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.message }));
        return;
      }

      const pillbox = loadPillboxStatus();
      const schedule = loadScheduleAndLogs();

      broadcastEvent('data_updated', {
        type: 'FILL',
        index,
        status: { pillbox, schedule },
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, pillbox, schedule }));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error filling compartment' }));
    }
    return;
  }

  // POST /api/alert (simulate missed dose alert)
  if (pathname === '/api/alert' && req.method === 'POST') {
    try {
      const { compartment_index } = await parseJsonBody(req);
      const index = parseInt(compartment_index, 10);

      const pillbox = loadPillboxStatus();
      const comp = pillbox.compartments.find((c) => c.compartment_index === index);
      const schedule = loadScheduleAndLogs();
      const medications = loadMedications();

      const med = comp ? medications.find((m) => m.id === comp.medication_id) : null;
      const medName = med ? med.brand_name : (comp?.medication_id || 'Medication');

      if (comp) {
        comp.led_active = true;
        savePillboxStatus(pillbox);
      }

      const existingLog = schedule.intake_logs.find(
        (log) => log.compartment_index === index && log.status === 'PENDING'
      );

      if (existingLog) {
        existingLog.status = 'MISSED';
        existingLog.caregiver_notified = true;
      } else {
        schedule.intake_logs.push({
          id: `log_alert_${Date.now().toString().slice(-4)}`,
          scheduled_time: new Date().toISOString(),
          actual_time: null,
          compartment_index: index,
          medication_name: medName,
          status: 'MISSED',
          caregiver_notified: true,
        });
      }

      saveScheduleAndLogs(schedule);

      // Automated inbox notification for Caregiver (Alert) and Patient (Reminder)
      addInboxMessage({
        from: 'SYSTEM_PILLBOX',
        to: 'CAREGIVER',
        sender_name: 'Dosette Alert Dispatcher',
        title: '🚨 Missed Dose (>30m Delay)',
        content: `Urgent: ${schedule.patient_name} has not taken his scheduled dose of ${medName} (${comp?.label || ''}) after >30 min delay!`,
        type: 'ALERT',
        medication_name: medName,
        compartment_index: index,
      });

      addInboxMessage({
        from: 'SYSTEM_PILLBOX',
        to: 'PATIENT',
        sender_name: 'Dosette Pillbox',
        title: '⏰ Overdue Medication Reminder',
        content: `Dear ${schedule.patient_name}, please do not forget to take your ${medName} in Compartment ${index} (${comp?.label || ''}).`,
        type: 'ALERT',
        medication_name: medName,
        compartment_index: index,
      });

      broadcastEvent('data_updated', {
        type: 'ALERT',
        index,
        medication: medName,
        status: { pillbox, schedule },
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, pillbox, schedule }));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error triggering alert' }));
    }
    return;
  }

  // POST /api/reset
  if (pathname === '/api/reset' && req.method === 'POST') {
    resetAllData();
    const pillbox = loadPillboxStatus();
    const schedule = loadScheduleAndLogs();
    const medications = loadMedications();

    broadcastEvent('data_updated', {
      type: 'RESET',
      status: { pillbox, schedule, medications },
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, pillbox, schedule, medications }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing if requested
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌟 DOSETTE Smart Pillbox & AI Companion Web Server`);
  console.log(`📡 URL:      http://localhost:${PORT}`);
  console.log(`⚡ API:      http://localhost:${PORT}/api/status`);
  console.log(`🔄 Realtime: SSE Active (/api/events)`);
  console.log(`======================================================\n`);
});
