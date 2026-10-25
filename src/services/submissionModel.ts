export interface SubmissionInput { fullName: string; phone: string; branch: string; originalUrl: string; }
export interface Submission extends SubmissionInput { id: string; submittedAt: string; updatedAt?: string; }
export function validateSubmission(input: SubmissionInput): SubmissionInput {
  const fullName = input.fullName.trim();
  const branch = input.branch.trim();
  const phone = (input.phone ?? '').trim().replace(/[\s().-]/g, '');
  if (!/^\+?[0-9]{9,15}$/.test(phone)) throw new Error('Số điện thoại cần từ 9 đến 15 chữ số, có thể bắt đầu bằng +.');
  if (fullName.length < 2 || fullName.length > 120) throw new Error('Họ tên cần từ 2 đến 120 ký tự.');
  if (branch.length < 2 || branch.length > 160) throw new Error('Đơn vị cần từ 2 đến 160 ký tự.');
  let url: URL;
  try { url = new URL(input.originalUrl.trim()); } catch { throw new Error('Đường dẫn bài dự thi không hợp lệ.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.href.length > 2000) throw new Error('Chỉ nhận đường dẫn http/https, tối đa 2.000 ký tự, không chứa tài khoản hoặc mật khẩu.');
  return { fullName, phone, branch, originalUrl: url.href };
}
export const submissionDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
