import type { SignId } from '@/lib/keys';

// PLACEHOLDER: well-known members of each Tribe, for Dawa to review, from the old Lovable site's lists
// (Nov 4, David) with corrections. Names only, never a birth date (invariant 8 covers the living). Each
// name's Sun sign was checked against the Swiss Ephemeris across its whole birth day, so no one here sits on a
// cusp; birthdays before the Gregorian calendar reached their country were checked in both calendars.
// The old lists put Virginia Woolf under Cancer (she is an Aquarius), Gertrude Stein under Cancer (born
// in February, an Aquarius) and Serena Williams under Cancer (born in September, a Libra).
export const TRIBE_FAMOUS: Record<SignId, readonly string[]> = {
  aries: ['Vincent van Gogh', 'Charlie Chaplin', 'Joseph Campbell', 'Maya Angelou', 'Leonard Nimoy', 'Aretha Franklin', 'Elton John', 'Lady Gaga'],
  taurus: ['Johannes Brahms', 'Pyotr Ilyich Tchaikovsky', 'Sigmund Freud', 'Duke Ellington', 'Katharine Hepburn', 'Audrey Hepburn', 'George Clooney', 'Adele'],
  gemini: ['Ralph Waldo Emerson', 'Walt Whitman', 'Marilyn Monroe', 'Allen Ginsberg', 'Morgan Freeman', 'Bob Dylan', 'Paul McCartney', 'Prince'],
  cancer: ['Henry David Thoreau', 'Nikola Tesla', 'Ernest Hemingway', 'Frida Kahlo', 'The Dalai Lama', 'Harrison Ford', 'Robin Williams', 'Tom Hanks'],
  leo: ['Carl Jung', 'Coco Chanel', 'Louis Armstrong', 'Julia Child', 'Andy Warhol', 'Jerry Garcia', 'Mick Jagger', 'Madonna'],
  virgo: ['Johann Wolfgang von Goethe', 'Mary Shelley', 'Leo Tolstoy', 'Agatha Christie', 'Mother Teresa', 'Freddie Mercury', 'Keanu Reeves', 'Beyoncé'],
  libra: ['Oscar Wilde', 'Mahatma Gandhi', 'Eleanor Roosevelt', 'T. S. Eliot', 'John Lennon', 'Kate Winslet', 'Serena Williams', 'Bruno Mars'],
  scorpio: ['Marie Curie', 'Pablo Picasso', 'Carl Sagan', 'Joni Mitchell', 'Neil Young', 'Whoopi Goldberg', 'Julia Roberts', 'Leonardo DiCaprio'],
  sagittarius: ['William Blake', 'Ludwig van Beethoven', 'Jane Austen', 'Emily Dickinson', 'Mark Twain', 'Tina Turner', 'Jimi Hendrix', 'Taylor Swift'],
  capricorn: ['Isaac Newton', 'Benjamin Franklin', 'Alan Watts', 'Martin Luther King Jr.', 'Elvis Presley', 'Muhammad Ali', 'Janis Joplin', 'David Bowie'],
  aquarius: ['Wolfgang Amadeus Mozart', 'Charles Darwin', 'Abraham Lincoln', 'Virginia Woolf', 'Rosa Parks', 'Bob Marley', 'Oprah Winfrey', 'Michael Jordan'],
  pisces: ['George Washington', 'Frédéric Chopin', 'Albert Einstein', 'Gabriel García Márquez', 'Johnny Cash', 'Elizabeth Taylor', 'George Harrison', 'Simone Biles'],
};
