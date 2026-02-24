import { Footer } from './Footer';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Footer',
  decorators: [Story => <div className="w-80">{Story()}</div>],
};

type Story = StoryObj;

const Default: Story = { render: () => <Footer /> };

export default meta;
export { Default };
