// PLACEHOLDER: the Council, hellos, and messages (5b, Nov 11). Our words, not Dawa's, until his copy
// replaces them. "The Council" is his name for a place where all Tribes talk (Aug 24 call; the business
// plan's intertribal council). No key name but Tribe is typed here.

export const COUNCIL_POST_MAX = 2000;
export const HELLO_NOTE_MAX = 300;
export const MESSAGE_MAX = 2000;
export const REPORT_REASON_MAX = 500;

// The row of three under the main nav's Council item for members (5b; David, Nov 11: "council").
export const communityCopy = {
  label: 'Council',
  tabs: { council: 'Council', members: 'Members', messages: 'Messages' },
  /** Messages in the user menu: its accessible name with the count. */
  inbox: (count: number) => (count === 0 ? 'Messages' : count === 1 ? 'Messages, 1 new' : `Messages, ${count} new`),
};

export const councilCopy = {
  title: 'The Council',
  eyebrow: 'Council',
  line: 'The Council,',
  accent: 'all 12 Tribes in one room.',
  lede: 'One place for every member to post, ask, and answer. Newest first. No algorithm picks what you see.',
  whoSees: 'Every signed-in member sees what you post here, with your name. Your chart stays as private as you set it.',
  newHeading: 'Start a conversation',
  newLabel: 'Your post',
  post: 'Post',
  reply: 'Reply',
  replyLabel: (name: string) => `Your reply to ${name}`,
  sendReply: 'Send reply',
  delete: 'Delete',
  deleteLabel: 'Delete your post',
  report: 'Report',
  reportLabel: (name: string) => `Report ${name}'s post`,
  reportReason: 'What is wrong with it? (optional)',
  sendReport: 'Send report',
  reported: 'Thanks. An admin will look at it.',
  removed: 'Post removed.',
  replies: (count: number) => (count === 1 ? '1 reply' : `${count} replies`),
  emptyHeading: 'Nobody has posted yet',
  emptyBody: 'Be the first. Say who you are, what brought you here, or what you are curious about.',
  failed: "We couldn't load the Council just now. Try again in a minute.",
  notReady: 'The Council opens once its database tables are in place.',
  errors: {
    empty: 'Write something first.',
    long: `Keep it under ${COUNCIL_POST_MAX} characters.`,
    limit: 'You are posting quickly. Wait a minute and try again.',
    failed: "That didn't post. Try again.",
  },
  posted: 'Posted.',
  needsName: 'Choose a display name on your account page before you post.',
};

export const helloCopy = {
  heading: 'Say hello',
  body: (name: string) =>
    `Send ${name} a short note. If they accept, a private conversation opens between the two of you. If not, nothing more happens.`,
  label: 'Your note',
  send: 'Send hello',
  sent: (name: string) => `Hello sent. ${name}'s answer will show under Messages.`,
  waiting: (name: string) => `You said hello. Waiting for ${name} to answer.`,
  theyWrote: (name: string) => `${name} said hello.`,
  accepted: 'Open your conversation',
  declined: 'Your hello was not accepted.',
  declinedByYou: 'You declined their hello.',
  // On a members list card (David, Nov 11: "should say hello be there?").
  card: {
    say: 'Say hello',
    sayLabel: (name: string) => `Say hello to ${name}`,
    answer: 'Answer their hello',
    answerLabel: (name: string) => `Answer ${name}'s hello`,
    waiting: 'Hello sent',
    message: 'Message',
    messageLabel: (name: string) => `Message ${name}`,
  },
  errors: {
    empty: 'Write a short note first.',
    long: `Keep it under ${HELLO_NOTE_MAX} characters.`,
    limit: 'You are sending quickly. Wait a few minutes and try again.',
    exists: 'There is already a hello between the two of you.',
    failed: "That didn't send. Try again.",
  },
};

export const messagesCopy = {
  title: 'Messages',
  eyebrow: 'Messages',
  line: 'Your',
  accent: 'conversations.',
  lede: 'A conversation opens once a hello is accepted. You can say hello from the Members page or any member’s page.',
  waitingHeading: 'Hellos waiting for you',
  accept: 'Accept',
  decline: 'Decline',
  acceptLabel: (name: string) => `Accept ${name}'s hello`,
  declineLabel: (name: string) => `Decline ${name}'s hello`,
  conversationsHeading: 'Conversations',
  sentHeading: 'Hellos you sent',
  sentWaiting: 'Waiting for an answer',
  sentDeclined: 'Not accepted',
  none: 'No conversations yet.',
  findSomeone: 'Find someone on the Members page',
  unread: (count: number) => (count === 1 ? '1 new' : `${count} new`),
  you: 'You',
  back: 'All messages',
  conversationWith: (name: string) => `Conversation with ${name}`,
  hello: 'Their hello',
  yourHello: 'Your hello',
  label: 'Your message',
  send: 'Send',
  notFound: "This conversation isn't open.",
  checkBack: 'There are no email alerts yet. New hellos and messages show as a count in your menu at the top of the page.',
  failed: "We couldn't load your messages just now. Try again in a minute.",
  errors: {
    empty: 'Write something first.',
    long: `Keep it under ${MESSAGE_MAX} characters.`,
    limit: 'You are sending quickly. Wait a minute and try again.',
    failed: "That didn't send. Try again.",
  },
};

export const safetyCopy = {
  heading: 'Safety',
  block: 'Block',
  report: 'Report',
  reportMessageLabel: (name: string) => `Report this message from ${name}`,
  blockLabel: (name: string) => `Block ${name}`,
  blockBody: (name: string) =>
    `Blocking hides ${name}'s posts, hellos, and messages from you, and yours from them. They are not told.`,
  unblock: 'Unblock',
  blocked: (name: string) => `You blocked ${name}.`,
  reportMember: (name: string) => `Report ${name}`,
  reportReason: 'What happened? (optional)',
  sendReport: 'Send report',
  reported: 'Thanks. An admin will look at it.',
  failed: "That didn't go through. Try again.",
};

// Team-only words for the admin page's reports.
export const reportsAdminCopy = {
  heading: 'Reports',
  none: 'No open reports.',
  post: 'Council post',
  message: 'Message',
  member: 'Member',
  about: (name: string) => `About ${name}`,
  reason: 'Reason',
  noReason: 'No reason given.',
  remove: 'Remove post',
  resolve: 'Mark handled',
  removed: 'Removed',
};

// What a submit button says while its form is on its way (micro motion, David, Nov 11: "feel
// responsive"; `components/SubmitButton.tsx`). PLACEHOLDER like the rest of this file.
export const sendingCopy = {
  posting: 'Posting',
  sending: 'Sending',
  accepting: 'Accepting',
  declining: 'Declining',
  blocking: 'Blocking',
  unblocking: 'Unblocking',
};
