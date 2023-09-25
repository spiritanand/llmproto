//  view for the loadSummarizationChain node

// export const loadSummarizationChain = (
//  llm: BaseLanguageModel,
//  params: SummarizationChainParams = { type: "map_reduce" }
// )

import { ClassicPreset } from "rete";

import LoadSummarizationChain from "@/models/Chains/LoadSummarizationChain";
import { CheckboxControl } from "@/views/Components/Checkbox";
import { DropdownControl } from "@/views/Components/Dropdown";

export default class LoadSummarizationChainNode extends ClassicPreset.Node<
  { inputs: ClassicPreset.Socket },
  {},
  { type: DropdownControl; returnIntermediateSteps: CheckboxControl }
> {
  height = 200;

  width = 250;

  private _chain: LoadSummarizationChain;

  constructor(chain: LoadSummarizationChain, socket: ClassicPreset.Socket) {
    super("Chain");

    this._chain = chain;

    this.addControl(
      "type",
      new DropdownControl(
        "type",
        ["map_reduce", "refine", "stuff"],
        this._chain.initialType,
        async (value) => {
          await chain.setType(value);
        },
      ),
    );

    this.addControl(
      "returnIntermediateSteps",
      new CheckboxControl(
        "returnIntermediateSteps",
        this._chain.initialReturnIntermediateSteps,
        async (value) => {
          await chain.setReturnIntermediateSteps(value);
        },
      ),
    );

    this.addInput("inputs", new ClassicPreset.Input(socket, "Inputs", true));
  }
}
