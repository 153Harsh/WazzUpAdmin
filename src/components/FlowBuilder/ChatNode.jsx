import { Handle } from "reactflow";
import { useState } from "react";

const ChatNode = ({ id, data }) => {
  const [label, setLabel] = useState(data.label);
  const [options, setOptions] = useState(data.options || []);
  const [editing, setEditing] = useState(false);

  const handleLabelChange = (e) => setLabel(e.target.value);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].label = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { label: "New Option" }]);
  };

  const removeOption = (index) => {
    const updated = [...options];
    updated.splice(index, 1);
    setOptions(updated);
  };

  const saveChanges = () => {
    setEditing(false);
    data.onEdit?.(id, label, options);
  };

  const isList = options?.length > 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md min-w-[220px] relative">
      {/* Delete Button */}
      <button
        onClick={() => data.onDelete?.(id)}
        className="text-xs text-red-500 underline absolute top-1 right-2"
      >
        Delete
      </button>

      {editing ? (
        <>
          <input
            className="border border-gray-300 px-2 py-1 w-full mb-2 text-sm rounded"
            value={label}
            onChange={handleLabelChange}
          />
          {options.map((opt, index) => (
            <div key={index} className="flex mb-1">
              <input
                value={opt.label}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="border border-gray-300 px-2 py-1 text-sm rounded w-full"
              />
              <button
                onClick={() => removeOption(index)}
                className="ml-1 text-red-600 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="text-xs text-blue-600 underline mt-1"
          >
            + Add Option
          </button>
          <button
            onClick={saveChanges}
            className="block bg-green-500 text-white text-xs px-2 py-1 rounded mt-2"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <div className="text-gray-800 text-sm mb-2">{label}</div>
          {options.map((opt, index) => (
            <div key={index} className="flex items-center justify-between">
              <button
                className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded mb-1 block w-full text-left"
                onClick={() => data.onOptionClick?.(opt)}
              >
                {opt.label}
              </button>
              {/* Handle for each option */}
              <Handle
                type="source"
                position="right"
                id={`option_${index}`}
                style={{ top: 48 + index * 35, right: -8 }}
              />
            </div>
          ))}
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 underline mt-2"
          >
            Edit
          </button>
        </>
      )}

      {!isList ? (
        <>
          <Handle type="target" position="left" id="left-in" />
          <Handle type="source" position="right" id="right-out" />
        </>
      ) : (
        <Handle type="target" position="left" id="list-in" />
      )}
    </div>
  );
};

export default ChatNode;
