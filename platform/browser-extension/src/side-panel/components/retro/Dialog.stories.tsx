import { Button } from './Button';
import { Dialog } from './Dialog';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Retro/Dialog',
  decorators: [Story => <div className="p-8">{Story()}</div>],
};

type Story = StoryObj;

const Default: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button size="sm">Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>Dialog Title</Dialog.Header>
        <Dialog.Body>
          <p className="text-foreground text-sm">This is a retro-styled dialog with header, body, and footer.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="sm">Confirm</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

const Destructive: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline" className="text-destructive">
          Remove Plugin
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header className="bg-destructive text-destructive-foreground border-destructive">
          Remove Plugin
        </Dialog.Header>
        <Dialog.Body>
          <p className="text-foreground text-sm">
            Are you sure you want to remove <strong>Slack</strong>? This will remove the plugin from your config.
          </p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="sm" variant="outline" className="text-destructive border-destructive">
            Remove
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

const BodyOnly: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button size="sm">Minimal</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>Notice</Dialog.Header>
        <Dialog.Body>
          <p className="text-foreground text-sm">A dialog with just a header and body, no footer.</p>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  ),
};

export default meta;
export { Default, Destructive, BodyOnly };
