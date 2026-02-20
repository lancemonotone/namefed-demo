/**
 * NAMEFED Membership – Eligibility checker & step wizard (demo)
 */
(function () {
  'use strict';

  // Eligibility checker
  const employerSelect = document.getElementById('eligibility-employer');
  const areaSelect = document.getElementById('eligibility-area');
  const checkBtn = document.getElementById('eligibility-check-btn');
  const resultEl = document.getElementById('eligibility-result');

  if (checkBtn && resultEl) {
    checkBtn.addEventListener('click', function () {
      const employer = employerSelect ? employerSelect.value : '';
      const area = areaSelect ? areaSelect.value : '';

      if (!employer || !area) {
        resultEl.textContent = 'Please answer both questions.';
        resultEl.className = 'eligibility-result eligibility-result--warning';
        resultEl.hidden = false;
        return;
      }

      const qualifyingEmployers = ['city', 'city-yard', 'schools', 'fire', 'police', 'ems', 'housing', 'retiree', 'family'];
      const qualifies = qualifyingEmployers.includes(employer) || (employer === 'other' && area === 'yes');

      if (qualifies) {
        resultEl.innerHTML = 'You appear to qualify for membership! Proceed to the application below.';
        resultEl.className = 'eligibility-result eligibility-result--success';
      } else {
        resultEl.innerHTML = 'Based on your answers, you may not currently qualify. <a href="contact.html">Contact us</a> to discuss your options.';
        resultEl.className = 'eligibility-result eligibility-result--info';
      }
      resultEl.hidden = false;
    });
  }

  // Step wizard
  const form = document.querySelector('.membership-wizard');
  if (!form) return;

  const panels = form.querySelectorAll('.wizard-panel');
  const steps = form.querySelectorAll('.wizard-step');
  const prevBtn = form.querySelector('.wizard-prev');
  const nextBtn = form.querySelector('.wizard-next');
  const submitBtn = form.querySelector('.wizard-submit');
  const totalSteps = panels.length;
  let currentStep = 1;

  function showStep(step) {
    currentStep = step;
    panels.forEach(function (p) {
      const n = parseInt(p.getAttribute('data-panel'), 10);
      p.hidden = n !== step;
    });
    steps.forEach(function (s) {
      const n = parseInt(s.getAttribute('data-step'), 10);
      s.classList.toggle('active', n === step);
      s.classList.toggle('complete', n < step);
    });
    prevBtn.disabled = step <= 1;
    nextBtn.hidden = step >= totalSteps;
    submitBtn.hidden = step < totalSteps;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentStep > 1) showStep(currentStep - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      const panel = form.querySelector('.wizard-panel[data-panel="' + currentStep + '"]');
      const required = panel ? panel.querySelectorAll('[required]') : [];
      let valid = true;
      required.forEach(function (el) {
        if (!el.checkValidity || !el.checkValidity()) valid = false;
      });
      if (valid && currentStep < totalSteps) {
        showStep(currentStep + 1);
      } else if (!valid) {
        form.reportValidity();
      }
    });
  }

  showStep(1);

  // Mailing address toggle
  const mailingSame = document.getElementById('mailing-same');
  const mailingFields = document.getElementById('mailing-address-fields');
  if (mailingSame && mailingFields) {
    function toggleMailing() {
      mailingFields.hidden = mailingSame.checked;
    }
    mailingSame.addEventListener('change', toggleMailing);
    toggleMailing();
  }

  // Relationship field when family
  const eligibilityType = document.getElementById('eligibility-type');
  const relationshipRow = document.getElementById('relationship-row');
  if (eligibilityType && relationshipRow) {
    eligibilityType.addEventListener('change', function () {
      relationshipRow.hidden = eligibilityType.value !== 'family';
    });
  }
})();
