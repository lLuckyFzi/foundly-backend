export interface RegisterDTO {
  nama: string;
  email: string;
  password: string;
  kontak: string;
  role?: 'PUBLIC' | 'ADMIN';
}

export interface LoginDTO {
  email: string;
  password: string;
}