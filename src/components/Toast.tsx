import { Icons } from './Icons';

interface Props { message: string }

export function Toast({ message }: Props) {
  return (
    <div className="toast">
      <Icons.Check size={14} />
      {message}
    </div>
  );
}
