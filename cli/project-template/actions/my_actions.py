##################################################################################
#  You can add your actions in this file or create any other file in this folder #
##################################################################################

from rasa_sdk import Action
from rasa_sdk.events import SlotSet, ReminderScheduled, ConversationPaused, ConversationResumed, FollowupAction, Restarted, ReminderScheduled

class MyAction(Action):

    def name(self):
        return 'action_sample'

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Actions work")# do something.
        return []