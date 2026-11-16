import {triage} from './triage.mjs';
const form=document.querySelector('#request-form');
const subject=document.querySelector('#subject');
const body=document.querySelector('#body');
const examples={
  billing:['Invoice copy','Please share the invoice for our fictional workspace.'],
  technical:['API timeout','The demo API shows a timeout when opening a synthetic report.'],
  mixed:['Two problems','I need a refund and cannot log in to the fictional workspace.'],
  security:['Security concern','The fictional account may be compromised. Please reset the password.'],
};
for(const button of document.querySelectorAll('[data-example]')) {
  button.addEventListener('click',()=>{
    [subject.value,body.value]=examples[button.dataset.example];
    form.requestSubmit();
  });
}
form.addEventListener('submit',event=>{
  event.preventDefault();
  const error=document.querySelector('#error');
  error.textContent='';
  try {
    const result=triage({id:'browser-example',subject:subject.value,body:body.value});
    document.querySelector('#decision').classList.toggle('review',result.requiresHumanReview);
    document.querySelector('#badge').textContent=result.requiresHumanReview?'Human review required':'Route proposal only';
    document.querySelector('#route').textContent=result.route?result.route[0].toUpperCase()+result.route.slice(1):'Review queue';
    const reasons={single_route_match:'One supported category matched. This is a deterministic proposal, not a probability of correctness.',multiple_routes:'The request matches multiple categories. A person should decide how to split or route it.',no_supported_route:'No supported route matched. A person should interpret this request.',security_signal:'A security-related phrase matched an illustrative guard. Escalate for human review.',sensitive_context:'A sensitive-context phrase matched an illustrative guard. Escalate for human review.',instruction_signal:'An instruction-like phrase matched an illustrative guard. Request text cannot change routing policy.'};
    document.querySelector('#reason').textContent=reasons[result.reason];
    document.querySelector('#json').textContent=JSON.stringify(result,null,2);
  } catch {
    error.textContent='Enter a nonempty subject (up to 140 characters) and request (up to 2,000 characters), without control characters.';
    document.querySelector('#badge').textContent='Invalid request';
    document.querySelector('#route').textContent='No decision';
    document.querySelector('#reason').textContent='Correct the input and try again.';
    document.querySelector('#json').textContent='No decision produced.';
  }
});
