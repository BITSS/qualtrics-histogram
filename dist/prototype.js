if ('QID1' in Qualtrics.SurveyEngine.QuestionInfo) {
  var q = Qualtrics.SurveyEngine.QuestionData.getInstance('QID1');
  q.disableNextButton();
  var choiceContainer = jQuery(q.getChoiceContainer());
  choiceContainer.hide();
  choiceContainer.after(
    q
      .getChoices()
      .map(function(choice) {
        return "<div><input data-choice='" + choice + "' class='test-input' /></div>";
      })
      .join('')
  );
  jQuery(document).on('change', '.test-input', function(ev) {
    var el = jQuery(ev.currentTarget);
    q.setChoiceValue(el.data('choice'), el.val());
    var sum = 0;
    jQuery('.test-input').each(function(i, el) {
      sum += parseInt(el.value, 10);
    });
    if (sum === 100) {
      q.enableNextButton();
    } else {
      q.disableNextButton();
    }
  });
}
