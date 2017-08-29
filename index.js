const questions = ['QID1', 'QID2'];
const questionInfo = Qualtrics.SurveyEngine.QuestionInfo;
var widgets = {};

questions.forEach(question_id => {
  if (!(question_id in questionInfo)) {
    return;
  }
  let qInfo = questionInfo[question_id];
  let q = Qualtrics.SurveyEngine.QuestionData.getInstance(question_id);
  const barWidth = 100;
  const styles = {
    widget: `
      height: 240px;
      position: relative;
      margin: 40px 150px 0 50px;
      border: 1px solid beige;
    `,
    bar: `
      border: 1px solid black;
      position: absolute;
      bottom: 0;
      width: ${barWidth}px;
      background-color: gray;
      height: 20%;
    `,
    grabber: `
      height: 10px;
      background-color: #297fca;
      cursor: ns-resize;
    `,
    percentage: `
      text-align: center;
      margin-top: -34px;
    `,
    gridline: `
      position: absolute;
      width: 100%;
      border-top: 1px solid beige;
    `,
    yaxis: `
      position: absolute;
      left: -50px;
      width: 45px;
      text-align: right;
      margin-top: -0.5em;
    `,
    total: `
      position: absolute;
      right: -150px;
      width: 150px;
      text-align: center;
      top: 50%;
      margin-top: -1em;
    `,
  };
  //q.hideChoices();
  let histogramId = `histogram_${Math.random()}`;
  q.getChoiceContainer().insertAdjacentHTML(
    'afterend',
    `
    <div id="${histogramId}" style="${styles.widget}" class="histogram-widget" data-question-id="${question_id}">
      <div style="${styles.yaxis} top: 100%;">0%</div>
      <div style="${styles.yaxis} top: 50%;">50%</div>
      <div style="${styles.yaxis} top: 0;">100%</div>
      <div style="${styles.gridline} top: 50%;"></div>
      <div style="${styles.gridline} top: 25%;"></div>
      <div style="${styles.gridline} top: 75%;"></div>
      <div style="${styles.total}"><strong>Total</strong><br /><span class="total">100%</span></div>
      ${q
        .getChoices()
        .map(
          (choice, index) =>
            `<div class="histogram-bar" style="${styles.bar} left: ${index * (barWidth - 1)}px;">
              <div class="histogram-grabber" style="${styles.grabber}"></div>
              <div class="histogram-percentage" style="${styles.percentage}">20%</div>
            </div>`
        )
        .join('')}
    </div>
  `
  );
  let inserted = document.getElementById(histogramId);
  widgets[inserted.id] = {
    element: inserted,
    qinfo: qInfo,
    question: q,
    bars: inserted.querySelectorAll('.histogram-bar'),
    total: inserted.querySelector('.total'),
  };
});

var mouseup = null;
const mouseMove = ({ widget, bar }) => {
  const widgetObj = widgets[widget.id];
  const hper = bar.querySelector('.histogram-percentage');
  return ev => {
    let rect = widget.getBoundingClientRect();
    let percent = (rect.top + document.body.scrollTop - ev.pageY + rect.height) / rect.height * 100;
    percent = Math.min(100, percent);
    percent = Math.max(0, percent);
    bar.style.height = `${percent}%`;
    hper.innerText = parseInt(percent, 10) + '%';
    widgetObj.total.innerText =
      [...widgetObj.bars]
        .map(bar => parseInt(bar.style.height, 10))
        .reduce((sum, value) => sum + value, 0) + '%';
  };
};
const mouseUp = ({ mousemove, bar }) => ev => {
  bar.style.backgroundColor = 'blue';
  document.removeEventListener('mousemove', mousemove);
  document.removeEventListener('mouseup', mouseup);
};
document.addEventListener('mousedown', ev => {
  if (ev.target.className === 'histogram-grabber') {
    let bar = ev.target.parentElement;
    let widget = bar.parentElement;
    let mousemove = mouseMove({ widget, bar });
    mouseup = mouseUp({ mousemove, bar, widget });
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }
});