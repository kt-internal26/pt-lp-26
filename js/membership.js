/* =====================================================
   Pratap Chandra Das Memorial Trust — Membership JS
   Membership & Donate page only
   ===================================================== */

'use strict';

/* --------------------------------------------------
   Auto-switch tab based on URL hash (#donate)
-------------------------------------------------- */
if (window.location.hash === '#donate') {
  switchMode('donate');
  const donateEl = document.getElementById('donate');
  if (donateEl) donateEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --------------------------------------------------
   Tab / Mode Switcher
-------------------------------------------------- */
function switchMode(mode) {
  document.querySelectorAll('.mem-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.mem-mode-panel').forEach(p => p.classList.remove('active'));
  const tab   = document.getElementById('tab-' + mode);
  const panel = document.getElementById('mode-' + mode);
  if (tab)   tab.classList.add('active');
  if (panel) panel.classList.add('active');
}

/* --------------------------------------------------
   Membership Form Validation & Submit
-------------------------------------------------- */
function handleFormSubmit(e) {
  const form   = document.getElementById('membershipForm');
  const fields = ['fullName','fatherName','address','city','district','pincode','state','age','idNumber','bloodGroup','profession','phone'];
  let valid    = true;

  fields.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    const errEl = document.getElementById('err-' + id);

    const isEmpty = !input.value.trim();
    const pinInvalid   = id === 'pincode' && input.value && !/^[0-9]{6}$/.test(input.value);
    const phoneInvalid = id === 'phone'   && input.value && !/^[6-9][0-9]{9}$/.test(input.value);
    const ageInvalid   = id === 'age'     && input.value && (isNaN(input.value) || +input.value < 5 || +input.value > 120);

    if (isEmpty || pinInvalid || phoneInvalid || ageInvalid) {
      input.classList.add('input-error');
      if (errEl) errEl.classList.add('visible');
      valid = false;
    } else {
      input.classList.remove('input-error');
      if (errEl) errEl.classList.remove('visible');
    }
  });

  if (!valid) {
    e.preventDefault();
    const firstError = form.querySelector('.input-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  /* Show loading state */
  const btnText   = document.getElementById('submitBtnText');
  const btnLoader = document.getElementById('submitBtnLoader');
  const submitBtn = document.getElementById('submitBtn');
  if (btnText)   btnText.style.display   = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';
  if (submitBtn) submitBtn.disabled      = true;

  /* Simulate submission then show success */
  setTimeout(() => {
    const formEl    = document.getElementById('membershipForm');
    const successEl = document.getElementById('formSuccess');
    const step1     = document.getElementById('jstep-1');
    const step2     = document.getElementById('jstep-2');
    if (formEl)    formEl.style.display    = 'none';
    if (successEl) successEl.style.display = 'block';
    if (step1)  { step1.classList.remove('active'); step1.classList.add('done'); }
    if (step2)    step2.classList.add('active');
  }, 2000);
}

/* --------------------------------------------------
   Scroll to Payment Panel
-------------------------------------------------- */
function scrollToPayment() {
  const panel = document.getElementById('paymentPanel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --------------------------------------------------
   FAQ Accordion Toggle
-------------------------------------------------- */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const arrow  = btn.querySelector('.faq-arrow');
  const isOpen = answer.classList.contains('open');

  document.querySelectorAll('.mem-faq-a.open').forEach(a => {
    a.classList.remove('open');
    const prevArrow = a.previousElementSibling.querySelector('.faq-arrow');
    if (prevArrow) prevArrow.style.transform = '';
  });

  if (!isOpen) {
    answer.classList.add('open');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
}

/* --------------------------------------------------
   Live Validation on Input
-------------------------------------------------- */
document.querySelectorAll('.mem-form input, .mem-form select, .mem-form textarea')
  .forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.classList.remove('input-error');
        const errEl = document.getElementById('err-' + input.id);
        if (errEl) errEl.classList.remove('visible');
      }
    });
  });

/* --------------------------------------------------
   Membership Category & Plan Selector
-------------------------------------------------- */
let _mcatType  = 'nokit';
let _mcatPlan  = 'monthly';
let _mcatFee   = '₹500';
let _mcatLabel = 'Monthly Membership';
let _mcatNote  = '/month';

function selectCategory(type, btn) {
  _mcatType = type;
  document.querySelectorAll('.mcat-cat-card').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const kitIncludes    = document.getElementById('mcatKitIncludes');
  const mandatoryFee   = document.getElementById('mcatMandatoryFee');
  if (kitIncludes)  kitIncludes.classList.toggle('visible', type === 'kit');
  if (mandatoryFee) mandatoryFee.classList.toggle('visible', type === 'kit');

  _updatePaymentPanel();
}

function selectPlan(plan, fee, label, note, btn) {
  _mcatPlan  = plan;
  _mcatFee   = fee;
  _mcatLabel = label;
  _mcatNote  = note;

  document.querySelectorAll('.mcat-plan-card').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');

  _updatePaymentPanel();
}

function _updatePaymentPanel() {
  const planLabelEl  = document.getElementById('payPlanLabel');
  const feeDisplayEl = document.getElementById('payFeeDisplay');
  const feeNoteEl    = document.getElementById('payFeeNote');
  const badgeEl      = document.getElementById('payBadgeDisplay');
  const waBtn        = document.getElementById('waConfirmBtn');

  if (planLabelEl) planLabelEl.textContent = _mcatLabel;
  if (feeNoteEl)   feeNoteEl.textContent   = _mcatNote + (_mcatType === 'kit' ? ' + ₹1,000 reg. fee' : '');

  /* Update the fee amount text node */
  if (feeDisplayEl) {
    const textNode = feeDisplayEl.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.nodeValue = _mcatFee + '\u00a0';
    }
  }

  if (badgeEl) {
    badgeEl.textContent = _mcatType === 'kit' ? '🎁 With Kit' : '🌟 Without Kit';
  }

  /* Update WhatsApp pre-fill message */
  if (waBtn) {
    const kitStr = _mcatType === 'kit'
      ? `With Kit (includes ₹1,000 mandatory registration fee)`
      : 'Without Kit';
    const msg = `Hi, I have filled the membership form and completed the payment for PCDMT Foundation membership.\n\nPlan: ${_mcatLabel} (${_mcatFee}) — ${kitStr}\n\nPlease find my screenshot attached.`;
    waBtn.href = 'https://wa.me/+918144918717?text=' + encodeURIComponent(msg);
  }
}
