// components/FlowBuilder/NodeTypes/index.js
export { default as StartNode } from './StartNode';
export { default as MessageNode } from './MessageNode';
export { default as WAButtonsNode } from './WAButtonsNode';
export { default as WAListNode } from './WAListNode';
export { default as WAMediaNode } from './WAMediaNode';
export { default as WATemplateNode } from './WATemplateNode';
export { default as InputNode } from './InputNode';
export { default as ConditionNode } from './ConditionNode';
export { default as APINode } from './APINode';
export { default as DelayNode } from './DelayNode';
export { default as EndNode } from './EndNode';
export { default as EndSessionNode } from './EndSessionNode';

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  end_session: EndSessionNode,
  message: MessageNode,
  wa_buttons: WAButtonsNode,
  wa_list: WAListNode,
  wa_media: WAMediaNode,
  wa_template: WATemplateNode,
  input: InputNode,
  delay: DelayNode,
  condition: ConditionNode,
  api: APINode,
};