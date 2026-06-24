import { Request } from 'express';
import { LogModel, LogEventType } from '../models/log.model';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = req.ip || req.socket.remoteAddress || '';
  }
  // Strip IPv6 prefix ::ffff:
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  if (ip === '::1' || ip === '127.0.0.1') return 'localhost';
  return ip || 'unknown';
}

export async function logEvent(
  event: LogEventType,
  req: Request,
  data: { userName?: string; email?: string; success?: boolean }
): Promise<void> {
  try {
    const ua = req.headers['user-agent'] || '';
    const ip = getClientIp(req);

    await LogModel.create({
      event,
      userName: data.userName || '',
      email: data.email || '',
      ip,
      userAgent: ua,
      success: data.success ?? true,
    });
  } catch {
    // silent fail — logging should never break the app
  }
}
