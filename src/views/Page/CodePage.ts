import { createRoot } from "react-dom/client";
import { GetSchemes, NodeEditor } from "rete";
import { AreaExtensions, AreaPlugin } from "rete-area-plugin";
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from "rete-auto-arrange-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { Presets, ReactArea2D, ReactPlugin } from "rete-react-plugin";

import { createChain } from "@/controllers/chain";
import { createLangchain } from "@/controllers/generateCode";
import { createLLMModel } from "@/controllers/openAI";
import { createTextSplitter } from "@/controllers/textSplitter";
import Button, { ButtonControl } from "@/views/Components/Button";
import Checkbox, { CheckboxControl } from "@/views/Components/Checkbox";
import Dropdown, { DropdownControl } from "@/views/Components/Dropdown";
import ChainNode from "@/views/Nodes/LoadSummarizationChainNode";
import OpenAINode from "@/views/Nodes/OpenAINode";
import RecursiveCharacterTextSplitterNode from "@/views/Nodes/RecursiveCharacterTextSplitter";

// type Node = OpenAINode | CodeNode;
type Schemes = GetSchemes<any, any>; // TODO: Need to fix the Schemes type. It needs to hold the right Node type for giving better context in plugin configuration. WORKS FINE FOR NOW.

type AreaExtra = ReactArea2D<any>;

export default async function createEditor(container: HTMLElement) {
  const id = await createLangchain({ name: "summarization" });

  const openAI = await createLLMModel(id);
  const chain = await createChain(id);
  const recursiveCharacterTextSplitter = await createTextSplitter(id);

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const arrange = new AutoArrangePlugin<Schemes>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        control(data) {
          if (data.payload instanceof ButtonControl) {
            return Button;
          }

          if (data.payload instanceof DropdownControl) {
            return Dropdown;
          }

          if (data.payload instanceof CheckboxControl) {
            return Checkbox;
          }

          return Presets.classic.Control;
        },
      },
    }),
  );

  connection.addPreset(ConnectionPresets.classic.setup());

  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area);

  area.use(connection);
  area.use(render);
  area.use(arrange);

  AreaExtensions.simpleNodesOrder(area);
  AreaExtensions.showInputControl(area);

  const openAINode = new OpenAINode(openAI);
  const chainNode = new ChainNode(chain);
  const recursiveCharacterTextSplitterNode =
    new RecursiveCharacterTextSplitterNode(recursiveCharacterTextSplitter);

  await editor.addNode(openAINode);
  await editor.addNode(chainNode);
  await editor.addNode(recursiveCharacterTextSplitterNode);

  await arrange.layout();
  await AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy(),
  };
}
