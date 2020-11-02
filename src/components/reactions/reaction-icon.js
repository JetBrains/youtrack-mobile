import React from 'react';

import {UNIT} from '../variables/variables';

const iconSize: number = UNIT * 2;

//TODO: get rid of importing each SVG
const ReactionIcon = ({name, ...rest}) => {
  let Icon = null;

  switch (name) {
  case 'yes':
    Icon = React.lazy(() => import('./assets/yes.svg'));
    break;
  case 'thanks':
    Icon = React.lazy(() => import('./assets/thanks.svg'));
    break;
  case 'thumbs-up':
    Icon = React.lazy(() => import('./assets/thumbs-up.svg'));
    break;
  case 'thumbs-down':
    Icon = React.lazy(() => import('./assets/thumbs-down.svg'));
    break;
  case 'strong':
    Icon = React.lazy(() => import('./assets/strong.svg'));
    break;
  case 'clapping':
    Icon = React.lazy(() => import('./assets/clapping.svg'));
    break;
  case 'ok':
    Icon = React.lazy(() => import('./assets/ok.svg'));
    break;
  case 'congratulations':
    Icon = React.lazy(() => import('./assets/congratulations.svg'));
    break;
  case 'glad':
    Icon = React.lazy(() => import('./assets/glad.svg'));
    break;
  case 'worry':
    Icon = React.lazy(() => import('./assets/worry.svg'));
    break;
  case 'grimacing':
    Icon = React.lazy(() => import('./assets/grimacing.svg'));
    break;
  case 'grinning':
    Icon = React.lazy(() => import('./assets/grinning.svg'));
    break;
  case 'joy':
    Icon = React.lazy(() => import('./assets/joy.svg'));
    break;
  case 'tongue-out':
    Icon = React.lazy(() => import('./assets/tongue-out.svg'));
    break;
  case 'saint':
    Icon = React.lazy(() => import('./assets/saint.svg'));
    break;
  case 'cool':
    Icon = React.lazy(() => import('./assets/cool.svg'));
    break;
  case 'surprised':
    Icon = React.lazy(() => import('./assets/surprised.svg'));
    break;
  case 'sleepy':
    Icon = React.lazy(() => import('./assets/sleepy.svg'));
    break;
  case 'relieved':
    Icon = React.lazy(() => import('./assets/relieved.svg'));
    break;
  case 'scared':
    Icon = React.lazy(() => import('./assets/scared.svg'));
    break;
  case 'sick':
    Icon = React.lazy(() => import('./assets/sick.svg'));
    break;
  case 'tired':
    Icon = React.lazy(() => import('./assets/tired.svg'));
    break;
  case 'tears':
    Icon = React.lazy(() => import('./assets/tears.svg'));
    break;
  case 'wink':
    Icon = React.lazy(() => import('./assets/wink.svg'));
    break;
  case 'nerd':
    Icon = React.lazy(() => import('./assets/nerd.svg'));
    break;
  case 'crossed-fingers':
    Icon = React.lazy(() => import('./assets/crossed-fingers.svg'));
    break;
  case 'waiting':
    Icon = React.lazy(() => import('./assets/waiting.svg'));
    break;
  case 'thank-you':
    Icon = React.lazy(() => import('./assets/thank-you.svg'));
    break;
  case 'fist':
    Icon = React.lazy(() => import('./assets/fist.svg'));
    break;
  case 'raised-hand':
    Icon = React.lazy(() => import('./assets/raised-hand.svg'));
    break;
  case 'wave':
    Icon = React.lazy(() => import('./assets/wave.svg'));
    break;
  case 'rock':
    Icon = React.lazy(() => import('./assets/rock.svg'));
    break;
  case 'mind-blown':
    Icon = React.lazy(() => import('./assets/mind-blown.svg'));
    break;
  case 'cat-in-love':
    Icon = React.lazy(() => import('./assets/cat-in-love.svg'));
    break;
  case 'scared-cat':
    Icon = React.lazy(() => import('./assets/scared-cat.svg'));
    break;
  case 'rocket':
    Icon = React.lazy(() => import('./assets/rocket.svg'));
    break;
  case 'teddybear':
    Icon = React.lazy(() => import('./assets/teddybear.svg'));
    break;
  case 'red-heart':
    Icon = React.lazy(() => import('./assets/red-heart.svg'));
    break;
  case 'no':
    Icon = React.lazy(() => import('./assets/no.svg'));
    break;
  case 'question':
    Icon = React.lazy(() => import('./assets/question.svg'));
    break;
  case '100':
    Icon = React.lazy(() => import('./assets/100.svg'));
    break;
  case 'eyes':
    Icon = React.lazy(() => import('./assets/eyes.svg'));
    break;
  case 'plus-one':
    Icon = React.lazy(() => import('./assets/plus-one.svg'));
    break;
  case 'minus-one':
    Icon = React.lazy(() => import('./assets/minus-one.svg'));
    break;
  case 'comment':
    Icon = React.lazy(() => import('./assets/comment.svg'));
    break;
  case 'okay':
    Icon = React.lazy(() => import('./assets/okay.svg'));
    break;
  case 'zero':
    Icon = React.lazy(() => import('./assets/zero.svg'));
    break;
  case 'one':
    Icon = React.lazy(() => import(`./assets/one.svg`));
    break;
  case 'two':
    Icon = React.lazy(() => import('./assets/two.svg'));
    break;
  case 'three':
    Icon = React.lazy(() => import('./assets/three.svg'));
    break;
  case 'four':
    Icon = React.lazy(() => import('./assets/four.svg'));
    break;
  case 'five':
    Icon = React.lazy(() => import('./assets/five.svg'));
    break;
  case 'six':
    Icon = React.lazy(() => import('./assets/six.svg'));
    break;
  case 'seven':
    Icon = React.lazy(() => import('./assets/seven.svg'));
    break;
  case 'eight':
    Icon = React.lazy(() => import('./assets/eight.svg'));
    break;
  case 'nine':
    Icon = React.lazy(() => import('./assets/nine.svg'));
    break;
  }

  return Icon ? <Icon {...{width: iconSize, height: iconSize, rest}} /> : null;
};


export default ReactionIcon;
