export interface ProxySetting {
  mode: string;
  protocol: string | null;
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
}
