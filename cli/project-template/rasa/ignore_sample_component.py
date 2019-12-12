from typing import Any, List, Optional, Text, Dict
from rasa.nlu.components import Component
from rasa.nlu.training_data import Message
from rasa.nlu.config import RasaNLUModelConfig
from rasa.nlu.model import Metadata


class SampleComponent(Component):
    name = "SampleComponent"

    def __init__(
        self,
        component_config: Dict[Text, Any] = None,
    ) -> None:
        super(SampleComponent, self).__init__(component_config)

    def process(self, message, **kwargs):
        # type: (Message, **Any) -> None
        message.set("it_works", True, add_to_output=True)

    @classmethod
    def create(
        cls, component_config: Dict[Text, Any], config: RasaNLUModelConfig
    ) -> "SampleComponent":
        return cls(component_config)

    @classmethod
    def load(
        cls,
        meta: Dict[Text, Any],
        model_dir: Text = None,
        model_metadata: Metadata = None,
        cached_component: Optional["SampleComponent"] = None,
        **kwargs: Any
    ) -> "SampleComponent":
        return cls(meta)
