export class RegisterDto {
  email: string;
  password: string;
  name: string;
  type: 'student' | 'instructor';
}
