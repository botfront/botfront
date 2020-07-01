##################################################################################
#  You can add your actions in this file or create any other file in this folder #
##################################################################################

from rasa_sdk import Action
from rasa_sdk.events import SlotSet, ReminderScheduled, ConversationPaused, ConversationResumed, FollowupAction, Restarted, ReminderScheduled


class MyAction(Action):

    def name(self):
        return 'action_my_action'

    def run(self, dispatcher, tracker, domain):
        # do something.
        return []