export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  type: 'student' | 'instructor';
}
