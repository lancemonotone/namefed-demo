/**
 * NAMEFED Membership – Eligibility checker & step wizard (demo)
 * Runs after contentloaded (blocks injected) on membership page
 */
(function () {
  "use strict";

  function init() {
    // Eligibility checker
    const employerSelect = document.getElementById("eligibility-employer");
    const areaSelect = document.getElementById("eligibility-area");
    const checkBtn = document.getElementById("eligibility-check-btn");
    const resultEl = document.getElementById("eligibility-result");

    if (checkBtn && resultEl) {
      checkBtn.addEventListener("click", function () {
        const employer = employerSelect ? employerSelect.value : "";
        const area = areaSelect ? areaSelect.value : "";

        if (!employer || !area) {
          resultEl.textContent = "Please answer both questions.";
          resultEl.className = "eligibility-result eligibility-result--warning";
          resultEl.hidden = false;
          return;
        }

        const qualifyingEmployers = [
          "city",
          "city-yard",
          "schools",
          "fire",
          "police",
          "ems",
          "housing",
          "retiree",
          "family",
        ];
        const qualifies =
          qualifyingEmployers.includes(employer) ||
          (employer === "other" && area === "yes");

        if (qualifies) {
          resultEl.innerHTML =
            'You appear to qualify for membership! <button type="button" class="btn btn-primary eligibility-continue-btn" id="eligibility-continue-btn">Continue to Application</button>';
          resultEl.className = "eligibility-result eligibility-result--success";
          resultEl.hidden = false;
          const continueBtn = document.getElementById(
            "eligibility-continue-btn",
          );
          const wizardModal = document.getElementById("wizard-modal");
          if (continueBtn && wizardModal && window.Modal) {
            continueBtn.addEventListener("click", function () {
              Modal.open(wizardModal, { focusSelector: "input, select" });
            });
          }
        } else {
          resultEl.innerHTML =
            'Based on your answers, you may not currently qualify. <a href="contact.html">Contact us</a> to discuss your options.';
          resultEl.className = "eligibility-result eligibility-result--info";
        }
        resultEl.hidden = false;
      });
    }

    // Step wizard
    const form = document.querySelector(".membership-wizard");
    if (!form) return;

    const wizardContainer = form.closest(".flow") || form.parentElement;
    const panels = form.querySelectorAll(".wizard-panel");
    const steps = wizardContainer
      ? wizardContainer.querySelectorAll(".wizard-step")
      : [];
    const prevBtn = form.querySelector(".wizard-prev");
    const nextBtn = form.querySelector(".wizard-next");
    const submitBtn = form.querySelector(".wizard-submit");
    const totalSteps = panels.length;
    let currentStep = 1;

    function showStep(step) {
      currentStep = step;
      panels.forEach(function (p) {
        const n = parseInt(p.getAttribute("data-panel"), 10);
        p.hidden = n !== step;
      });
      steps.forEach(function (s) {
        const n = parseInt(s.getAttribute("data-step"), 10);
        s.classList.toggle("active", n === step);
        s.classList.toggle("complete", n < step);
      });
      prevBtn.disabled = step <= 1;
      nextBtn.hidden = step >= totalSteps;
      submitBtn.hidden = step < totalSteps;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentStep > 1) showStep(currentStep - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        const panel = form.querySelector(
          '.wizard-panel[data-panel="' + currentStep + '"]',
        );
        const required = panel ? panel.querySelectorAll("[required]") : [];
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const wizardModalEl = document.getElementById("wizard-modal");
      if (wizardModalEl) wizardModalEl.close();
      if (resultEl) {
        resultEl.innerHTML =
          "Thank you! Your application has been submitted. We'll review it within 1–2 business days and contact you to finalize your account.";
        resultEl.className = "eligibility-result eligibility-result--success";
        resultEl.hidden = false;
      }
    });

    showStep(1);

    // Modal: init wizard modal (close btn, reset wizard on close)
    const wizardModal = document.getElementById("wizard-modal");
    if (wizardModal && window.Modal) {
      Modal.init(wizardModal, {
        onClose: function () {
          showStep(1);
        },
      });
    }

    // Mailing address toggle
    const mailingSame = document.getElementById("mailing-same");
    const mailingFields = document.getElementById("mailing-address-fields");
    if (mailingSame && mailingFields) {
      function toggleMailing() {
        mailingFields.hidden = mailingSame.checked;
      }
      mailingSame.addEventListener("change", toggleMailing);
      toggleMailing();
    }

    // Eligibility step: conditional fields
    const eligibilityType = document.getElementById("eligibility-type");
    const relationshipRow = document.getElementById("relationship-row");
    const employerRow = document.getElementById("employer-row");
    const departmentRow = document.getElementById("department-row");
    const jobTitleRow = document.getElementById("job-title-row");
    const otherRow = document.getElementById("other-row");
    const employerInput = document.getElementById("employer");
    const eligibilityOtherInput = document.getElementById("eligibility-other");

    function updateEligibilityFields() {
      const val = eligibilityType ? eligibilityType.value : "";
      const showEmployer = val === "employee" || val === "retiree";
      const showRelationship = val === "family";
      const showOther = val === "other";

      if (relationshipRow) relationshipRow.hidden = !showRelationship;
      if (employerRow) employerRow.hidden = !showEmployer;
      if (departmentRow) departmentRow.hidden = !showEmployer;
      if (jobTitleRow) jobTitleRow.hidden = !showEmployer;
      if (otherRow) otherRow.hidden = !showOther;
      if (employerInput) employerInput.required = showEmployer;
      if (eligibilityOtherInput) eligibilityOtherInput.required = showOther;
    }

    if (eligibilityType) {
      eligibilityType.addEventListener("change", updateEligibilityFields);
      updateEligibilityFields();
    }

    // Prefill for presentation demo – generated sample values
    const demoData = {
      "eligibility-employer": "schools",
      "eligibility-area": "yes",
      "first-name": "Steven",
      "middle-name": "Paul",
      "last-name": "Novak",
      dob: "1985-03-14",
      email: "steven.novak@naps.org",
      phone: "(413) 555-0147",
      "phone-alt": "(413) 555-0199",
      "input_1_2_1": "42 Maple Street",
      "input_1_2_2": "",
      "input_1_2_3": "North Adams",
      "input_1_2_4": "MA",
      "input_1_2_5": "01247",
      "input_1_3_1": "42 Maple Street",
      "input_1_3_2": "",
      "input_1_3_3": "North Adams",
      "input_1_3_4": "MA",
      "input_1_3_5": "01247",
      "eligibility-type": "employee",
      employer: "North Adams Public Schools",
      department: "Facilities",
      "job-title": "Maintenance Technician",
      ownership: "single",
      "funding-method": "branch",
      "funding-amount": "25",
      "consent-terms": true,
      "consent-privacy": true,
      "consent-accurate": true,
      "consent-credit": true,
      marketing_email: true,
    };

    function prefillForm() {
      Object.keys(demoData).forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        const val = demoData[id];
        if (el.type === "checkbox") {
          el.checked = !!val;
        } else if (el.tagName === "SELECT") {
          el.value = val;
        } else {
          el.value = val;
        }
      });
      const productsMembership = form.querySelector(
        'input[name="products[]"][value="membership"]',
      );
      const productsChecking = form.querySelector(
        'input[name="products[]"][value="checking"]',
      );
      if (productsMembership) productsMembership.checked = true;
      if (productsChecking) productsChecking.checked = true;
    }

    // prefillForm();
  }

  var main = document.getElementById("main");
  if (main && main.dataset.page === "membership") {
    document.addEventListener("contentloaded", init);
    if (document.getElementById("eligibility-flow")) init();
  }
})();
