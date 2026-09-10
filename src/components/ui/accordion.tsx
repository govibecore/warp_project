import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccordionContextType {
  openItems: string[];
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

const AccordionItemContext = createContext<{ id: string; isOpen: boolean } | null>(null);

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

export function Accordion({
  children,
  type = 'single',
  defaultValue,
  className,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (type === 'single') {
        return prev.includes(id) ? [] : [id];
      }
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('divide-y divide-border border-y border-border', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function AccordionItem({ value, children, className, ...props }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionItem must be used within an Accordion');

  const isOpen = context.openItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ id: value, isOpen }}>
      <div className={cn('group border-border py-2', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error('AccordionTrigger must be used within AccordionItem');
  }

  const { id, isOpen } = itemContext;

  return (
    <button
      type="button"
      onClick={() => accordionContext.toggleItem(id)}
      aria-expanded={isOpen}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-display text-base font-bold transition-colors hover:text-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center font-mono text-primary transition-transform duration-200',
          isOpen && 'rotate-45'
        )}
        aria-hidden="true"
      >
        <Plus className="size-4" />
      </span>
    </button>
  );
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  const itemContext = useContext(AccordionItemContext);
  if (!itemContext) {
    throw new Error('AccordionContent must be used within AccordionItem');
  }

  const { isOpen } = itemContext;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'pb-4 pt-1 text-sm leading-relaxed text-foreground-secondary',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
