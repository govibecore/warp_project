
export function InteractiveScenarioCard({ 
  item, 
  selectedOptionId, 
  onSelect 
}: { 
  item: any; 
  selectedOptionId: string | undefined; 
  onSelect: (val: string) => void;
}) {
  const type = item.question_type || 'multiple_choice';

  if (type === 'code_block' || type === 'math_input') {
    return (
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-foreground-secondary">
          {type === 'code_block' ? 'Write your solution code below:' : 'Enter your mathematical formula:'}
        </label>
        <textarea
          className="w-full bg-accent/20 border border-border p-4 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
          rows={5}
          placeholder={type === 'code_block' ? 'function solve() {\n  // your code\n}' : 'e.g. E = mc^2'}
          value={selectedOptionId || ''}
          onChange={(e) => onSelect(e.target.value)}
        />
        {/* We map the free-form text input to a virtual option for the submitResponse to handle it */}
      </div>
    );
  }

  // Default: Multiple choice (the existing Nordic Lagom UI)
  return (
    <fieldset className="flex flex-col gap-0" aria-label="Response options">
      {item.options?.map((option: any, index: number) => {
        const isSelected = selectedOptionId === option.text;
        return (
          <label
            key={index}
            className={
              'group relative flex cursor-pointer items-center gap-3 sm:gap-4 border border-border px-4 py-3 sm:px-5 sm:py-4 text-left transition-colors -mt-px first:mt-0 ' +
              (isSelected
                ? 'z-10 border-primary bg-primary/8'
                : 'hover:border-border-strong')
            }
            style={{ transitionDuration: '200ms', transitionTimingFunction: 'var(--ease-lagom)' }}
          >
            <input
              type="radio"
              name="assessment-option"
              value={option.text}
              checked={isSelected}
              onChange={() => onSelect(option.text)}
              className="sr-only"
            />
            <span
              className={
                'flex size-7 shrink-0 items-center justify-center text-xs font-bold transition-colors ' +
                (isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-foreground-secondary')
              }
              aria-hidden="true"
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm font-medium leading-snug">{option.text}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
