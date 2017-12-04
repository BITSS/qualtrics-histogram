const handleIcon = require('./handle-icon.png');
const questions = [
  'QID44',
  'QID46',
  'QID74',
  'QID75',
  'QID112',
  'QID147',
  'QID148',
  'QID149',
  'QID150',
  'QID115',
  'QID151',
  'QID152',
  'QID153',
  'QID154',
];
//const questions = ['QID1', 'QID2'];
const questionInfo = Qualtrics.SurveyEngine.QuestionInfo;
let histogram = window.histogram || {};
var widgets = {};

import style from './index.css';

const updateStateOfNextButton = widgets => {
  let widget;
  for (let key of Object.keys(widgets)) {
    widget = widgets[key];
    let total = parseInt(widget.total.innerText, 10);
    if (total !== 100) {
      widget.question.disableNextButton();
      return;
    }
  }
  if (widget) {
    widget.question.enableNextButton();
  }
};

questions.forEach(question_id => {
  if (!(question_id in questionInfo)) {
    return;
  }
  let qInfo = questionInfo[question_id];
  let q = Qualtrics.SurveyEngine.QuestionData.getInstance(question_id);
  const barWidth = 100 / q.getChoices().length;
  const startingPercentage = 0;
  const widgetWidth = 240;
  const widgetHeight = 360;
  const styles = {
    widget: `
      height: ${widgetHeight}px;
    `,
    bar: `
      border: 1px solid black;
      position: absolute;
      bottom: 0;
      width: ${barWidth}%;
      background-color: #790200;
      height: ${startingPercentage}%;
    `,
    grabber: `
      height: 50px;
      margin-top: -23px;
      cursor: ns-resize;
      background: url(${handleIcon}) no-repeat center;
    `,
    percentage: `
      text-align: center;
      margin-top: -64px;
    `,
    xlabel: `
      width: ${barWidth}%;
    `,
    yaxislabel: `
      width: ${widgetHeight}px;
    `,
  };
  q.hideChoices();
  let histogramId = `histogram_${Math.random()}`;
  let choiceContainer = q.getChoiceContainer();
  if (!document.body.contains(choiceContainer)) {
    choiceContainer = document.getElementById(question_id).querySelector('.ChoiceStructure');
    choiceContainer.style.display = 'none';
  }
  choiceContainer.insertAdjacentHTML(
    'afterend',
    `
    <div id="${histogramId}" style="${styles.widget}" class="histogram-widget" data-question-id="${question_id}">
      <div class="yaxislabel" style="${styles.yaxislabel}">Percentage of the field</div>
      <div class="yaxis" style="top: 100%;">0%</div>
      <div class="yaxis" style="top: 50%;">50%</div>
      <div class="yaxis" style="top: 0;">100%</div>
      <div class="gridline" style="top: 50%;"></div>
      <div class="gridline" style="top: 25%;"></div>
      <div class="gridline" style="top: 75%;"></div>
      <div class="totalLabel"><strong>Total</strong> <span class="total">${startingPercentage *
        q.getChoices().length}%</span></div>
      ${q
        .getChoices()
        .map((choice, index) => {
          q.setChoiceValue(choice, startingPercentage);
          return `<div class="histogram-bar histogram-bar-${index}" data-input=".x-label-${index}" style="${styles.bar} left: ${index *
            barWidth}%;">
              <div class="histogram-grabber" style="${styles.grabber}"></div>
              <div class="histogram-percentage" style="${styles.percentage}">${startingPercentage}%</div>
            </div>`;
        })
        .join('')}
      <div class="xLabels">
      ${q
        .getChoices()
        .map((choice, index) => {
          return `<div class="x-label x-label-${index}" data-bar=".histogram-bar-${index}" style="${styles.xlabel} left: ${index *
            barWidth}%;"><input class="pinput" value="${startingPercentage}" type="number" max="100" min="0" size="3"><br/>${qInfo
            .Choices[index + 1].Text}</div>`;
        })
        .join('')}
      </div>
    </div>
  `
  );
  let inserted = document.getElementById(histogramId);
  if (inserted) {
    widgets[inserted.id] = {
      element: inserted,
      qinfo: qInfo,
      question: q,
      bars: inserted.querySelectorAll('.histogram-bar'),
      total: inserted.querySelector('.total'),
    };
  }

  updateStateOfNextButton(widgets);
});
const updateTotalPercentage = widgetObj => {
  // Calculate total percentage and set color of total.
  let totalPercentage = [...widgetObj.bars]
    .map(bar => parseInt(bar.style.height, 10))
    .reduce((sum, value) => sum + value, 0);
  widgetObj.total.innerText = totalPercentage + '%';
  if (totalPercentage > 100) {
    widgetObj.total.style.color = 'red';
  } else if (totalPercentage < 100) {
    widgetObj.total.style.color = 'blue';
  } else {
    widgetObj.total.style.color = 'inherit';
  }
};
var mouseup = null;
const mouseMove = ({ widget, bar }) => {
  const widgetObj = widgets[widget.id];
  const hper = bar.querySelector('.histogram-percentage');
  const percentInput = widget.querySelector(bar.getAttribute('data-input') + ' input');
  if (!widgetObj || !hper) {
    return () => null;
  }
  return ev => {
    let rect = widget.getBoundingClientRect();
    let scrollY = window.scrollY || document.documentElement.scrollTop;
    let pageY = ev.pageY;
    if (ev.touches && ev.touches[0]) {
      pageY = ev.touches[0].pageY;
    }
    let percent = (rect.top + scrollY - pageY + rect.height) / rect.height * 100;
    percent = Math.max(0, Math.min(100, percent));

    // Set bar height and label.
    bar.style.height = `${percent}%`;
    const percentInt = parseInt(percent, 10);
    hper.innerText = percentInt + '%';
    percentInput.value = percentInt;
    updateTotalPercentage(widgetObj);
  };
};
const mouseUp = ({ mousemove, bar, widget }) => {
  const widgetObj = widgets[widget.id];
  if (!widgetObj) {
    return () => null;
  }
  return ev => {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('touchmove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    document.removeEventListener('touchend', mouseup);

    // Indicate this bar has been moved.
    bar.style.backgroundColor = '#790200';

    // Update values for each choice.
    Array.from(widgetObj.bars).forEach((bar, index) => {
      widgetObj.question.setChoiceValue(
        widgetObj.question.getChoices()[index],
        parseInt(bar.style.height, 10)
      );
    });

    updateStateOfNextButton(widgets);
  };
};
var mouseDownUnmount = () => {};
const mouseDown = ev => {
  mouseDownUnmount();
  if (ev.target.className === 'histogram-grabber') {
    ev.preventDefault();
    let bar = ev.target.parentElement;
    let widget = bar.parentElement;
    let mousemove = mouseMove({ widget, bar });
    mouseup = mouseUp({ mousemove, bar, widget });
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('touchmove', mousemove);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('touchend', mouseup);
    mouseDownUnmount = () => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('touchmove', mousemove);
      document.removeEventListener('mouseup', mouseup);
      document.removeEventListener('touchend', mouseup);
    };
  }
};
const inputChange = ev => {
  if (ev.target.className.indexOf('pinput') !== -1) {
    const input = ev.target;
    let percentage = Math.max(0, Math.min(100, parseInt(input.value, 10)));
    if (isNaN(percentage)) {
      percentage = 0;
    }
    // Set bar height and label.
    const widget = input.parentElement.parentElement.parentElement;
    const bar = widget.querySelector(input.parentElement.getAttribute('data-bar'));
    const hper = bar.querySelector('.histogram-percentage');
    const widgetObj = widgets[widget.id];
    bar.style.height = `${percentage}%`;
    hper.innerText = percentage + '%';
    updateTotalPercentage(widgetObj);

    // Update values for each choice.
    Array.from(widgetObj.bars).forEach((bar, index) => {
      widgetObj.question.setChoiceValue(
        widgetObj.question.getChoices()[index],
        parseInt(bar.style.height, 10)
      );
    });

    updateStateOfNextButton(widgets);
  }
};
if (histogram.unmount) {
  histogram.unmount();
}
document.addEventListener('keyup', inputChange);
document.addEventListener('change', inputChange);
document.addEventListener('mousedown', mouseDown);
document.addEventListener('touchstart', mouseDown, { passive: false });
histogram = {
  unmount: () => {
    document.removeEventListener('mousedown', mouseDown);
    document.removeEventListener('touchstart', mouseDown);
    document.removeEventListener('keyup', inputChange);
    document.removeEventListener('change', inputChange);
  },
};
window.histogram = histogram;
