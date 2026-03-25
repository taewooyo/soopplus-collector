export interface ToggleProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  value: boolean;
  id?: string;
  description?: string;
}
