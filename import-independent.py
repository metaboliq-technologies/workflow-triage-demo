"""Reproduce an externally authored sample; no model or triage policy is called.

Only public synthetic instruction text and original intent labels are selected.
The untouched input is Bitext's; mapping, generic subject and JSON format are ours.
"""
import csv,hashlib,io,json,urllib.request
from pathlib import Path

REVISION='72ea2203180d14a416b579c657033ecd21e59a11'
REPO='https://github.com/bitext/customer-support-llm-chatbot-training-dataset'
FILE='data/Bitext_Sample_Customer_Support_Training_Dataset_27K_responses-v11.csv'
SEED='metaboliq-independent-v3-2026-11-16'
MAPPING={'recover_password':'access','registration_problems':'access',
         'check_invoice':'billing','get_invoice':'billing','check_payment_methods':'billing','payment_issue':'billing',
         'delete_account':None,'contact_human_agent':None}

def build_sample(raw):
    rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
    if not rows or not {'instruction','intent'}.issubset(rows[0]):raise ValueError('Unexpected source columns')
    cases=[];seen=set()
    for intent,route in MAPPING.items():
        candidates=[]
        for line,row in enumerate(rows,2):
            text=row['instruction']
            # Transport eligibility only. No policy/model outcomes enter selection.
            if row['intent']==intent and 4<=len(text)<=2000 and not any(ord(c)<32 for c in text):
                rank=hashlib.sha256((SEED+'|'+intent+'|'+text).encode()).hexdigest()
                candidates.append((rank,line,text))
        selected=0
        for rank,line,text in sorted(candidates):
            normalized=text.casefold().strip()
            if normalized in seen:continue
            seen.add(normalized);selected+=1
            cases.append({'input':{'id':f'ext-{len(cases)+1:03}','subject':'Support request','body':text},
              'expected':{'route':route,'requiresHumanReview':route is None},'stratum':intent,
              'provenance':{'csvLine':line,'originalIntent':intent,'instructionSha256':hashlib.sha256(text.encode()).hexdigest(),'selectionRank':rank}})
            if selected==5:break
        if selected!=5:raise ValueError('Insufficient unique eligible cases')
    return {'schemaVersion':1,'id':'bitext-independent-v3',
      'license':'CDLA-Sharing-1.0','licenseUrl':REPO+'/blob/'+REVISION+'/LICENSE.txt',
      'attribution':'Bitext Innovations (original synthetic instructions and intent labels).',
      'modificationNotice':'METABOLIQ selected and reformatted 40 instructions, added neutral subjects and IDs, and mapped original intents to workflow expectations. Original instruction text is unchanged. This enhanced dataset remains CDLA-Sharing-1.0; the repository source license does not restrict this data.',
      'source':{'repository':REPO,'revision':REVISION,'file':FILE,'sha256':hashlib.sha256(raw).hexdigest(),'sourceRows':len(rows)},
      'sampling':{'seed':SEED,'rule':'Lowest SHA-256(seed|intent|instruction), five unique eligible instructions per predefined intent; transport eligibility only.','intentMapping':MAPPING},
      'limitations':['Public synthetic training data, potentially present in model training; not a blind benchmark or customer traffic.',
       'Inputs authored independently by Bitext; workflow mapping authored by implementation author, not independent adjudication.',
       '10 access, 20 billing, 10 review; no technical, security, prompt-injection or multi-intent coverage. Diagnostics tested separately.',
       'No claims of improvement against earlier sets with different case mixes.'],
      'cases':cases}

if __name__=='__main__':
    url='https://raw.githubusercontent.com/bitext/customer-support-llm-chatbot-training-dataset/'+REVISION+'/'+FILE
    with urllib.request.urlopen(url,timeout=60) as response:raw=response.read(25_000_001)
    if len(raw)>25_000_000:raise ValueError('Source size exceeds bound')
    result=build_sample(raw)
    Path('independent-evaluation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False))
