import { Request } from 'express';
import { LogModel, LogEventType } from '../models/log.model';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
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
