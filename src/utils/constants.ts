import { Emotion } from '../types/emotion.types';

export const EMOTION_WHEEL_DATA: Emotion[] = [
  {
    id: 1,
    name: 'Happy',
    tier: 1,
    parentId: null,
    description: 'A feeling of pleasure and contentment',
    color: '#FFD700',
    characteristics: ['Smiling', 'Laughter', 'Positive energy'],
    children: [
      {
        id: 11,
        name: 'Joyful',
        tier: 2,
        parentId: 1,
        description: 'An intense feeling of happiness',
        color: '#FFC700',
        characteristics: ['Excited', 'Elated', 'Enthusiastic'],
        children: [
          {
            id: 111,
            name: 'Ecstatic',
            tier: 3,
            parentId: 11,
            description: 'Overwhelming joy and excitement',
            color: '#FFB700',
            characteristics: ['Peak happiness', 'Euphoria']
          },
          {
            id: 112,
            name: 'Thrilled',
            tier: 3,
            parentId: 11,
            description: 'Excited and delighted',
            color: '#FFC700',
            characteristics: ['Exhilarated', 'Delighted']
          }
        ]
      },
      {
        id: 12,
        name: 'Content',
        tier: 2,
        parentId: 1,
        description: 'A peaceful, satisfied feeling',
        color: '#FFE066',
        characteristics: ['Peaceful', 'Satisfied', 'At ease'],
        children: [
          {
            id: 121,
            name: 'Peaceful',
            tier: 3,
            parentId: 12,
            description: 'Calm and serene',
            color: '#FFE680',
            characteristics: ['Tranquil', 'Relaxed']
          },
          {
            id: 122,
            name: 'Grateful',
            tier: 3,
            parentId: 12,
            description: 'Appreciative and thankful',
            color: '#FFE066',
            characteristics: ['Thankful', 'Appreciative']
          }
        ]
      },
      {
        id: 13,
        name: 'Proud',
        tier: 2,
        parentId: 1,
        description: 'Feeling good about accomplishments',
        color: '#FFD700',
        characteristics: ['Accomplished', 'Confident'],
        children: [
          {
            id: 131,
            name: 'Confident',
            tier: 3,
            parentId: 13,
            description: 'Sure and self-assured',
            color: '#FFC700',
            characteristics: ['Self-assured', 'Strong']
          },
          {
            id: 132,
            name: 'Accomplished',
            tier: 3,
            parentId: 13,
            description: 'Having achieved goals',
            color: '#FFB700',
            characteristics: ['Successful', 'Victorious']
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Sad',
    tier: 1,
    parentId: null,
    description: 'A feeling of sorrow or unhappiness',
    color: '#4A90E2',
    characteristics: ['Low energy', 'Withdrawal', 'Heaviness'],
    children: [
      {
        id: 21,
        name: 'Lonely',
        tier: 2,
        parentId: 2,
        description: 'Feeling isolated or disconnected',
        color: '#5BA3F5',
        characteristics: ['Isolated', 'Disconnected'],
        children: [
          {
            id: 211,
            name: 'Abandoned',
            tier: 3,
            parentId: 21,
            description: 'Feeling deserted or left behind',
            color: '#6EB3FF',
            characteristics: ['Deserted', 'Forsaken']
          },
          {
            id: 212,
            name: 'Homesick',
            tier: 3,
            parentId: 21,
            description: 'Missing home or loved ones',
            color: '#5BA3F5',
            characteristics: ['Missing', 'Yearning']
          }
        ]
      },
      {
        id: 22,
        name: 'Vulnerable',
        tier: 2,
        parentId: 2,
        description: 'Feeling exposed or weak',
        color: '#4A90E2',
        characteristics: ['Exposed', 'Defenseless'],
        children: [
          {
            id: 221,
            name: 'Powerless',
            tier: 3,
            parentId: 22,
            description: 'Unable to control circumstances',
            color: '#3D7DD4',
            characteristics: ['Helpless', 'Ineffectual']
          },
          {
            id: 222,
            name: 'Weak',
            tier: 3,
            parentId: 22,
            description: 'Lacking strength or energy',
            color: '#4A90E2',
            characteristics: ['Feeble', 'Exhausted']
          }
        ]
      },
      {
        id: 23,
        name: 'Guilty',
        tier: 2,
        parentId: 2,
        description: 'Feeling responsible for wrongdoing',
        color: '#3D7DD4',
        characteristics: ['Remorseful', 'Ashamed'],
        children: [
          {
            id: 231,
            name: 'Ashamed',
            tier: 3,
            parentId: 23,
            description: 'Feeling embarrassed or disgraceful',
            color: '#3570CE',
            characteristics: ['Embarrassed', 'Disgraced']
          },
          {
            id: 232,
            name: 'Regretful',
            tier: 3,
            parentId: 23,
            description: 'Wishing you had acted differently',
            color: '#3D7DD4',
            characteristics: ['Remorseful', 'Sorry']
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Angry',
    tier: 1,
    parentId: null,
    description: 'A strong feeling of displeasure',
    color: '#FF6B6B',
    characteristics: ['Tension', 'Irritability', 'Hot energy'],
    children: [
      {
        id: 31,
        name: 'Frustrated',
        tier: 2,
        parentId: 3,
        description: 'Annoyed by obstacles or blockers',
        color: '#FF8085',
        characteristics: ['Blocked', 'Thwarted'],
        children: [
          {
            id: 311,
            name: 'Irritated',
            tier: 3,
            parentId: 31,
            description: 'Bothered by minor annoyances',
            color: '#FF8A8F',
            characteristics: ['Bothered', 'Vexed']
          },
          {
            id: 312,
            name: 'Annoyed',
            tier: 3,
            parentId: 31,
            description: 'Mildly displeased',
            color: '#FF8085',
            characteristics: ['Bothered', 'Pestered']
          }
        ]
      },
      {
        id: 32,
        name: 'Antagonistic',
        tier: 2,
        parentId: 3,
        description: 'Opposing or hostile toward others',
        color: '#FF5252',
        characteristics: ['Hostile', 'Combative'],
        children: [
          {
            id: 321,
            name: 'Aggressive',
            tier: 3,
            parentId: 32,
            description: 'Ready to attack or confront',
            color: '#FF4842',
            characteristics: ['Combative', 'Attacking']
          },
          {
            id: 322,
            name: 'Bitter',
            tier: 3,
            parentId: 32,
            description: 'Feeling resentful and cynical',
            color: '#FF5252',
            characteristics: ['Resentful', 'Cynical']
          }
        ]
      },
      {
        id: 33,
        name: 'Outraged',
        tier: 2,
        parentId: 3,
        description: 'Shocked and extremely angry',
        color: '#FF3B3B',
        characteristics: ['Shocked', 'Intense fury'],
        children: [
          {
            id: 331,
            name: 'Furious',
            tier: 3,
            parentId: 33,
            description: 'Extremely angry',
            color: '#FF2B2B',
            characteristics: ['Enraged', 'Seething']
          },
          {
            id: 332,
            name: 'Betrayed',
            tier: 3,
            parentId: 33,
            description: 'Feeling deeply wronged',
            color: '#FF3B3B',
            characteristics: ['Wronged', 'Double-crossed']
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Fearful',
    tier: 1,
    parentId: null,
    description: 'A feeling of anxiety or dread',
    color: '#9B59B6',
    characteristics: ['Tension', 'Worry', 'Hypervigilance'],
    children: [
      {
        id: 41,
        name: 'Anxious',
        tier: 2,
        parentId: 4,
        description: 'Nervous or worried about future',
        color: '#A568BD',
        characteristics: ['Nervous', 'Worried'],
        children: [
          {
            id: 411,
            name: 'Worried',
            tier: 3,
            parentId: 41,
            description: 'Concerned about possible outcomes',
            color: '#B378C5',
            characteristics: ['Concerned', 'Troubled']
          },
          {
            id: 412,
            name: 'Stressed',
            tier: 3,
            parentId: 41,
            description: 'Under mental or physical strain',
            color: '#A568BD',
            characteristics: ['Strained', 'Pressured']
          }
        ]
      },
      {
        id: 42,
        name: 'Insecure',
        tier: 2,
        parentId: 4,
        description: 'Lacking confidence or certainty',
        color: '#8B4BA8',
        characteristics: ['Doubtful', 'Uncertain'],
        children: [
          {
            id: 421,
            name: 'Inadequate',
            tier: 3,
            parentId: 42,
            description: 'Not good enough',
            color: '#7D42A0',
            characteristics: ['Insufficient', 'Unworthy']
          },
          {
            id: 422,
            name: 'Inferior',
            tier: 3,
            parentId: 42,
            description: 'Feeling less than others',
            color: '#8B4BA8',
            characteristics: ['Lesser', 'Subpar']
          }
        ]
      },
      {
        id: 43,
        name: 'Terrified',
        tier: 2,
        parentId: 4,
        description: 'Extremely frightened',
        color: '#7A3B8C',
        characteristics: ['Panic', 'Dread'],
        children: [
          {
            id: 431,
            name: 'Panicked',
            tier: 3,
            parentId: 43,
            description: 'Sudden overwhelming fear',
            color: '#6D3380',
            characteristics: ['Frantic', 'Hysterical']
          },
          {
            id: 432,
            name: 'Horrified',
            tier: 3,
            parentId: 43,
            description: 'Shocked and frightened',
            color: '#7A3B8C',
            characteristics: ['Shocked', 'Appalled']
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: 'Surprised',
    tier: 1,
    parentId: null,
    description: 'Feeling suddenly caught off guard',
    color: '#F39C12',
    characteristics: ['Sudden', 'Alert', 'Uncertain'],
    children: [
      {
        id: 51,
        name: 'Amazed',
        tier: 2,
        parentId: 5,
        description: 'Astonished or extremely impressed',
        color: '#F5AD41',
        characteristics: ['Astounded', 'Impressed'],
        children: [
          {
            id: 511,
            name: 'Astonished',
            tier: 3,
            parentId: 51,
            description: 'Shocked with wonder',
            color: '#F7BC59',
            characteristics: ['Stunned', 'Awestruck']
          },
          {
            id: 512,
            name: 'Awed',
            tier: 3,
            parentId: 51,
            description: 'Filled with awe and wonder',
            color: '#F5AD41',
            characteristics: ['Reverent', 'Wondrous']
          }
        ]
      },
      {
        id: 52,
        name: 'Confused',
        tier: 2,
        parentId: 5,
        description: 'Uncertain or unable to understand',
        color: '#E8941D',
        characteristics: ['Bewildered', 'Perplexed'],
        children: [
          {
            id: 521,
            name: 'Perplexed',
            tier: 3,
            parentId: 52,
            description: 'Puzzled or bewildered',
            color: '#E8941D',
            characteristics: ['Puzzled', 'Baffled']
          },
          {
            id: 522,
            name: 'Disoriented',
            tier: 3,
            parentId: 52,
            description: 'Confused about direction or situation',
            color: '#DB8B0B',
            characteristics: ['Lost', 'Muddled']
          }
        ]
      },
      {
        id: 53,
        name: 'Excited',
        tier: 2,
        parentId: 5,
        description: 'Enthusiastically interested',
        color: '#F39C12',
        characteristics: ['Enthusiastic', 'Energetic'],
        children: [
          {
            id: 531,
            name: 'Eager',
            tier: 3,
            parentId: 53,
            description: 'Keen and enthusiastic',
            color: '#F5AD41',
            characteristics: ['Keen', 'Keen']
          },
          {
            id: 532,
            name: 'Hopeful',
            tier: 3,
            parentId: 53,
            description: 'Optimistic about possibilities',
            color: '#F39C12',
            characteristics: ['Optimistic', 'Positive']
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'Disgusted',
    tier: 1,
    parentId: null,
    description: 'A strong dislike or aversion',
    color: '#27AE60',
    characteristics: ['Repulsion', 'Rejection', 'Aversion'],
    children: [
      {
        id: 61,
        name: 'Disapproving',
        tier: 2,
        parentId: 6,
        description: 'Strongly disapproving of something',
        color: '#2EBD6F',
        characteristics: ['Disdainful', 'Critical'],
        children: [
          {
            id: 611,
            name: 'Judging',
            tier: 3,
            parentId: 61,
            description: 'Making critical judgments',
            color: '#35CC7F',
            characteristics: ['Critical', 'Censorious']
          },
          {
            id: 612,
            name: 'Skeptical',
            tier: 3,
            parentId: 61,
            description: 'Not believing or trusting',
            color: '#2EBD6F',
            characteristics: ['Doubtful', 'Suspicious']
          }
        ]
      },
      {
        id: 62,
        name: 'Disappointed',
        tier: 2,
        parentId: 6,
        description: 'Sad because hopes were not fulfilled',
        color: '#229954',
        characteristics: ['Let down', 'Unfulfilled'],
        children: [
          {
            id: 621,
            name: 'Disenchanted',
            tier: 3,
            parentId: 62,
            description: 'Disillusioned or disappointed',
            color: '#1E8449',
            characteristics: ['Disillusioned', 'Cynical']
          },
          {
            id: 622,
            name: 'Discouraged',
            tier: 3,
            parentId: 62,
            description: 'Losing confidence or hope',
            color: '#229954',
            characteristics: ['Demoralized', 'Disheartened']
          }
        ]
      },
      {
        id: 63,
        name: 'Repelled',
        tier: 2,
        parentId: 6,
        description: 'Revolted or disgusted',
        color: '#1E8449',
        characteristics: ['Revolted', 'Sick'],
        children: [
          {
            id: 631,
            name: 'Sickened',
            tier: 3,
            parentId: 63,
            description: 'Feeling physically or morally ill',
            color: '#186A3B',
            characteristics: ['Revulsed', 'Nauseated']
          },
          {
            id: 632,
            name: 'Offended',
            tier: 3,
            parentId: 63,
            description: 'Hurt or insulted',
            color: '#1E8449',
            characteristics: ['Insulted', 'Wronged']
          }
        ]
      }
    ]
  }
];

export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Emotion Wheel';

export const EMOTION_COLORS = {
  happy: '#FFD700',
  sad: '#4A90E2',
  angry: '#FF6B6B',
  fearful: '#9B59B6',
  surprised: '#F39C12',
  disgusted: '#27AE60',
};
