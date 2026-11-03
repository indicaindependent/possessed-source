import { LogOut } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import IconToggle from '@/components/possessed/room/IconToggle';

// During countdown/active a stray tap must not end the match: ask first.
export default function LeaveButton({ confirm, onLeave }) {
  if (!confirm) return <IconToggle icon={LogOut} label="Leave haunt" onClick={onLeave} />;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <span><IconToggle icon={LogOut} label="Leave haunt" /></span>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-parchment/20 bg-ink text-parchment">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-2xl">Leave mid-round?</AlertDialogTitle>
          <AlertDialogDescription className="text-parchment/80">The round is in play. Leaving ends this match for both of you.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-parchment/30 bg-plum text-parchment">Keep playing</AlertDialogCancel>
          <AlertDialogAction onClick={onLeave} className="bg-pumpkin text-ink hover:bg-pumpkin/90">Leave</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}