const questions = ['QID1', 'QID2'];
const questionInfo = Qualtrics.SurveyEngine.QuestionInfo;
questions.forEach(question_id => {
  if (!(question_id in questionInfo)) {
    return;
  }
  let qInfo = questionInfo[question_id];
  let q = Qualtrics.SurveyEngine.QuestionData.getInstance(question_id);
  const barWidth = 80;
  const styles = {
    widget: `
      height: 240px;
      width: 100%;
      position: relative;
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
      background-color: red;
      cursor: ns-resize;
    `,
    percentage: `
      text-align: center;
      margin-top: -34px;
    `,
  };
  //q.hideChoices();
  q.getChoiceContainer().insertAdjacentHTML(
    'afterend',
    `
    <div style="${styles.widget}" class="histogram-widget" data-question-id="${question_id}">
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
  var mouseup = null;
  const mouseMove = ({ widget, bar }) => {
    const hper = bar.querySelector('.histogram-percentage');
    return ev => {
      let rect = widget.getBoundingClientRect();
      let percent =
        (rect.top + document.body.scrollTop - ev.pageY + rect.height) / rect.height * 100;
      percent = Math.min(100, percent);
      percent = Math.max(0, percent);
      bar.style.height = `${percent}%`;
      hper.innerText = parseInt(percent, 10) + '%';
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
});
