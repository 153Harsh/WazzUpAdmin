const NODE_STYLES = {
  startNode: { bg: "#E8F7EE", border: "#1F7A3F" },
  textNode: { bg: "#0e57cc", border: "#2457D8" },
  waButtonsNode: { bg: "#FFF1E6", border: "#E36A00" },
  waListNode: { bg: "#F0FFF4", border: "#1F9D55" },
  waMediaNode: { bg: "#F2EEFF", border: "#6D28D9" },
  waTemplateNode: { bg: "#FFF4F8", border: "#BE185D" },
  inputNode: { bg: "#F0F9FF", border: "#0284C7" },
  conditionNode: { bg: "#FFF7ED", border: "#C2410C" },
  apiNode: { bg: "#F3F4F6", border: "#111827" },
  delayNode: { bg: "#FEFCE8", border: "#854D0E" },
  formNode: { bg: "#EEF2FF", border: "#4338CA" },
  endFlowNode: { bg: "#FEE2E2", border: "#991B1B" },
  endSessionNode: { bg: "#E0F2FE", border: "#0369A1" },
};

export function getNodeBgAndBorder(nodeType) {
  const fallback = { bg: "#F9FAFB", border: "#6B7280" };
  if (!nodeType) return fallback;
  return NODE_STYLES[nodeType] || fallback;
}

