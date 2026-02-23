import { NumberStepper } from './NumberStepper';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof NumberStepper> = {
  title: 'Retro/NumberStepper',
  component: NumberStepper,
  decorators: [Story => <div className="flex items-center gap-3">{Story()}</div>],
};

type Story = StoryObj<typeof NumberStepper>;

/** Interactive wrapper that manages state for stories. */
const Controlled = (props: {
  initial?: string;
  min?: number;
  max?: number;
  step?: number;
  invalid?: boolean;
  label?: string;
  placeholder?: string;
}) => {
  const [value, setValue] = useState(props.initial ?? '9515');
  return (
    <div className="flex items-center gap-1.5">
      {props.label && <span className="text-muted-foreground font-mono text-xs">{props.label}</span>}
      <NumberStepper
        value={value}
        onChange={setValue}
        min={props.min}
        max={props.max}
        step={props.step}
        aria-invalid={props.invalid || undefined}
        aria-label="Number stepper"
        placeholder={props.placeholder}
        className="h-7"
      />
    </div>
  );
};

const Default: Story = {
  render: () => <Controlled />,
};

const WithLabel: Story = {
  render: () => <Controlled label="Port:" />,
};

const FiveDigitPort: Story = {
  render: () => <Controlled label="Port:" initial="65535" />,
};

const ThreeDigitPort: Story = {
  render: () => <Controlled label="Port:" initial="80" />,
};

const Invalid: Story = {
  render: () => <Controlled label="Port:" initial="abc" invalid />,
};

const CustomRange: Story = {
  render: () => <Controlled label="Step 10:" initial="100" min={0} max={1000} step={10} />,
};

const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-24 font-mono text-xs">4-digit</span>
        <Controlled initial="9515" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-24 font-mono text-xs">5-digit</span>
        <Controlled initial="65535" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-24 font-mono text-xs">2-digit</span>
        <Controlled initial="80" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-24 font-mono text-xs">with label</span>
        <Controlled label="Port:" initial="3000" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-24 font-mono text-xs">invalid</span>
        <Controlled initial="bad" invalid />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground w-24 font-mono text-xs">step=10</span>
        <Controlled initial="100" step={10} min={0} max={1000} />
      </div>
    </div>
  ),
};

export default meta;
export { Default, WithLabel, FiveDigitPort, ThreeDigitPort, Invalid, CustomRange, AllStates };
