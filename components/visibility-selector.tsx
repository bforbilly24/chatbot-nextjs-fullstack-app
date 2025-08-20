'use client';

import { type ReactNode, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LockIcon,
} from './icons';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

export type VisibilityType = 'private';

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can access this chat',
    icon: <LockIcon />,
  },
];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
} & React.ComponentProps<typeof Button>) {
  const { visibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((visibility) => visibility.id === visibilityType),
    [visibilityType],
  );

  return (
    <Button
      data-testid="visibility-selector"
      variant="outline"
      className="hidden md:flex md:px-2 md:h-[34px] cursor-default"
      disabled={true}
    >
      {selectedVisibility?.icon}
      {selectedVisibility?.label}
    </Button>
  );
}
