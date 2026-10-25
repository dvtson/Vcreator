export function cloudErrorMessage(error: unknown): string {
  const code=(error as {code?:string})?.code||'';
  if(code.includes('permission-denied'))return 'Firestore chưa cho phép truy cập. Cần áp dụng bộ Rules đã chuẩn bị và kiểm tra đúng tài khoản quản trị.';
  if(code.includes('unavailable')||code.includes('deadline-exceeded'))return 'Không kết nối được dữ liệu cloud. Vui lòng kiểm tra mạng và thử lại.';
  if(code.includes('resource-exhausted'))return 'Đã chạm giới hạn sử dụng Firestore. Vui lòng kiểm tra hạn mức trong Firebase Console.';
  return error instanceof Error?error.message:'Không tải được dữ liệu. Vui lòng thử lại.';
}
