"""Builds templates/X01-AI-SDLC-Tracker.xlsx"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import CellIsRule, FormulaRule
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'templates', 'X01-AI-SDLC-Tracker.xlsx')
F = 'Arial'
INK, SLATE, TEAL, GREY, EX = '0E2A33', '3E6B7A', '0E7C86', 'F2F4F5', '8A9BA2'
thin = Side(style='thin', color='C9D6DB'); BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
HDR, DATA0 = 4, 6          # header row, first data row (row 5 = example)

wb = Workbook()
def sheet(name, title, cols, rows=200, example=None, formulas=None, lists=None, notes=None, widths=None, date_cols=(), pct_cols=()):
    ws = wb.create_sheet(name)
    ws['A1'] = title; ws['A1'].font = Font(name=F, bold=True, size=14, color=INK)
    ws['A2'] = 'White cells: enter data.  Grey cells: calculated, do not edit.  Row 5 is an example; overwrite or delete it.'
    ws['A2'].font = Font(name=F, italic=True, size=9, color=SLATE)
    formulas = formulas or {}
    for i, c in enumerate(cols, 1):
        cell = ws.cell(HDR, i, c + (' (auto)' if c in formulas else ''))
        cell.font = Font(name=F, bold=True, color='FFFFFF', size=10)
        cell.fill = PatternFill('solid', fgColor=SLATE if c in formulas else INK)
        cell.alignment = Alignment(wrap_text=True, vertical='center'); cell.border = BORDER
        if notes and c in notes: cell.comment = Comment(notes[c], 'AI SDLC Council')
        ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(c, max(12, min(34, len(c) + 4)))
    ws.row_dimensions[HDR].height = 32
    last = DATA0 + rows - 1
    for r in range(HDR + 1, last + 1):
        for i, c in enumerate(cols, 1):
            cell = ws.cell(r, i); cell.border = BORDER; cell.font = Font(name=F, size=10)
            cell.alignment = Alignment(vertical='top', wrap_text=True)
            if c in formulas:
                cell.value = '=' + formulas[c].replace('{r}', str(r)); cell.fill = PatternFill('solid', fgColor=GREY)
            if i - 1 in date_cols: cell.number_format = 'dd-mmm-yyyy'
            if i - 1 in pct_cols: cell.number_format = '0.0%'
    if example:
        for i, v in enumerate(example, 1):
            if v is not None and cols[i - 1] not in formulas:
                c = ws.cell(HDR + 1, i, v); c.font = Font(name=F, size=10, italic=True, color=EX)
        ws.cell(HDR + 1, 1).comment = Comment('Example row showing the expected format. It is excluded from the Metrics sheet.', 'AI SDLC Council')
    for col, values in (lists or {}).items():
        idx = cols.index(col) + 1; L = get_column_letter(idx)
        dv = DataValidation(type='list', formula1='"' + ','.join(values) + '"', allow_blank=True)
        ws.add_data_validation(dv); dv.add(f'{L}{HDR + 1}:{L}{last}')
    ws.freeze_panes = ws.cell(HDR + 1, 2)
    ws.auto_filter.ref = f'A{HDR}:{get_column_letter(len(cols))}{last}'
    ws.sheet_view.zoomScale = 90
    return ws

# ---------- README ----------
rd = wb.active; rd.title = 'README'
lines = [
    ('X01  AI SDLC Tracker Workbook', 16, True, INK),
    ('Companion to PD-AISDLC-01, the AI-Augmented SDLC Process Definition. One workbook per product line and release train.', 10, False, SLATE),
    ('', 10, False, INK),
    ('How to use', 12, True, TEAL),
    ('1. Enter data only in white cells. Grey cells and columns marked (auto) are formulas; do not overwrite them.', 10, False, INK),
    ('2. Row 5 on every sheet is an example in grey italics. Overwrite or delete it; it is excluded from the Metrics sheet.', 10, False, INK),
    ('3. Use the drop-down lists for coded columns so the formulas and filters work.', 10, False, INK),
    ('4. Where a nightly job can feed a sheet (RTM from Jira, Git and the test tool), paste or import into the white columns only.', 10, False, INK),
    ('', 10, False, INK),
    ('Sheets', 12, True, TEAL),
    ('RTM — requirement traceability matrix. Coverage check flags any requirement without a PR, a test case or a passing result.', 10, False, INK),
    ('Gate Log — one row per gate (G0 to G9) per work item. Flags reviewer = AI operator and incomplete evidence.', 10, False, INK),
    ('AI Usage Log — one row per T11 declaration. Flags AI-generated artifacts without a declaration.', 10, False, INK),
    ('Parity — automation parity per release: approved = executed manually + automated + formally deferred.', 10, False, INK),
    ('Waivers — the T15 register with expiry tracking (90-day maximum).', 10, False, INK),
    ('CP Versions — Context Pack versions, the T14 requests they closed and the lead time.', 10, False, INK),
    ('Defect to Gate — which gate missed each defect and the preventive action (from T06).', 10, False, INK),
    ('Metrics — live summary of the Council metrics, calculated from the other sheets.', 10, False, INK),
    ('', 10, False, INK),
    ('Owners', 12, True, TEAL),
    ('RTM: Business Analyst (rows) and QA Lead (test columns).  Gate Log and AI Usage Log: gate owners.  Parity: QA Lead.  Waivers, CP Versions, Defect to Gate, Metrics: AI Governance Council.', 10, False, INK)
]
for i, (t, sz, b, col) in enumerate(lines, 1):
    c = rd.cell(i, 1, t); c.font = Font(name=F, size=sz, bold=b, color=col)
rd.column_dimensions['A'].width = 140

# ---------- RTM ----------
rtm_cols = ['REQ-ID', 'Revision', 'Requirement (short)', 'Module', 'Surface', 'Source (T01 ref)', 'Priority', 'SFVD ID and section', 'API operation(s)',
            'Design note', 'Pull request(s)', 'Test case IDs', 'Number of test cases', 'Latest test result', 'Defects', 'Release', 'Status', 'Coverage check']
sheet('RTM', 'Requirement Traceability Matrix', rtm_cols, rows=300,
      example=['DEP-REQ-214', 'r2', 'Depreciate from put-to-use date (daily pro-rata)', 'DEP', 'Microservices', 'T01 B1', 'Must', 'SFVD-DEP-07 §4.2', 'POST /assets/{id}/depreciation',
               'T03 DEP-DN-05', 'PR 1182', 'TC-DEP-214-01..05', 5, 'Pass', 'BUG-DEP-118', 'REL 4.7.0', 'Done'],
      formulas={'Coverage check': 'IF(A{r}="","",IF(Q{r}="Retired","Retired",IF(AND(K{r}<>"",M{r}>0,N{r}="Pass"),"OK","GAP")))'},
      lists={'Module': ['FAM', 'DEP', 'LBL', 'AUD', 'PLT'], 'Surface': ['Microservices', 'Mobile', 'Internal web', 'Multiple'], 'Priority': ['Must', 'Should', 'Could', "Won't"],
             'Latest test result': ['Pass', 'Fail', 'Blocked', 'Not run'], 'Status': ['Draft', 'Approved', 'In progress', 'Done', 'Retired']},
      notes={'Coverage check': 'OK when the requirement has a pull request, at least one test case and a passing latest result. The release job must find no GAP rows in scope.',
             'Revision': 'Blank for the original requirement; r2, r3 for revisions made by a CR (process definition 5.2).'},
      widths={'Requirement (short)': 36, 'SFVD ID and section': 18, 'API operation(s)': 26, 'Test case IDs': 18})

# ---------- Gate Log ----------
gate_cols = ['Work item ID', 'Work type', 'Stage', 'Gate', 'Artifact', 'Version', 'Context Pack version', 'AI used', 'L1 result', 'L1 link', 'L2 checklist complete',
             'AI operator', 'L3 reviewer', 'Reviewer is not operator', 'Decision', 'Gate owner', 'Date', 'Conditions / notes', 'Evidence complete']
sheet('Gate Log', 'Gate Log (one row per gate per work item)', gate_cols, rows=500,
      example=['CR-2026-031', 'CR', 'S2', None, 'SFVD-DEP-07', 'v2.1', 'CP v1.3', 'AI-G', 'Pass', 'jenkins/job/sfvd-check/412', 'Y', 'A. Rao', 'M. Iyer', None, 'Approve', 'BA Lead', '2026-11-04', ''],
      formulas={'Gate': 'IF(C{r}="","","G"&MID(C{r},2,1))',
                'Reviewer is not operator': 'IF(OR(L{r}="",M{r}=""),"",IF(L{r}<>M{r},"Y","NO"))',
                'Evidence complete': 'IF(A{r}="","",IF(AND(OR(I{r}="Pass",I{r}="N/A"),K{r}="Y",OR(H{r}="None",N{r}="Y"),O{r}<>""),"Yes","No"))'},
      lists={'Work type': ['NF', 'CR', 'SR'], 'Stage': ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'], 'AI used': ['None', 'AI-A', 'AI-G'],
             'L1 result': ['Pass', 'Fail', 'N/A'], 'L2 checklist complete': ['Y', 'N'], 'Decision': ['Approve', 'Approve with conditions', 'Reject']},
      notes={'Reviewer is not operator': 'NO means the L3 reviewer ran the AI prompt. That violates separation of duties; the gate is invalid.',
             'Evidence complete': 'Yes only when L1 passed (or N/A), the L2 checklist is complete, the reviewer is independent where AI was used, and a decision is recorded.'},
      date_cols=(16,), widths={'Artifact': 18, 'L1 link': 26, 'Conditions / notes': 30})

# ---------- AI Usage Log ----------
ai_cols = ['Date', 'Artifact ID', 'Version', 'Stage', 'AI operator', 'Tool', 'Prompt template', 'Context Pack version', 'Sections generated', 'Assumptions declared',
           'Unresolved at gate', 'Reviewer', 'T11 reference', 'Declared']
sheet('AI Usage Log', 'AI Usage Log (one row per T11 declaration)', ai_cols, rows=500,
      example=['2026-11-03', 'SFVD-DEP-07', 'v2.1', 'S2', 'A. Rao', '[approved tool]', 'P-S2 v3', 'CP v1.3', 'Sections 4.2, 5', 6, 0, 'M. Iyer', 'SFVD-DEP-07_T11'],
      formulas={'Declared': 'IF(B{r}="","",IF(M{r}<>"","Yes","Missing"))'},
      lists={'Stage': ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9']},
      notes={'Unresolved at gate': 'Must be 0 when the gate is signed (process definition 9.5).'}, date_cols=(0,), widths={'Sections generated': 26})

# ---------- Parity ----------
par_cols = ['Release', 'Approved test cases', 'Executed manually', 'Automated', 'Formally deferred', 'Parity', 'Parity status']
sheet('Parity', 'Automation Parity per Release', par_cols, rows=100,
      example=['REL 5.0.0', 61, 7, 54, 0],
      formulas={'Parity': 'IF(OR(A{r}="",B{r}=0),"",(C{r}+D{r}+E{r})/B{r})',
                'Parity status': 'IF(F{r}="","",IF(ROUND(F{r},4)=1,"Reconciled",IF(F{r}<1,"Cases missing","Over-count: check")))'},
      notes={'Executed manually': 'Cases executed by hand and NOT automated. An automated case is counted only under Automated, so nothing is counted twice.',
             'Formally deferred': 'Only cases deferred in writing with a reason, owner and target release.'}, pct_cols=(5,))

# ---------- Waivers ----------
w_cols = ['Waiver ID', 'Raised by', 'Date raised', 'Work item', 'Rule or gate waived', 'Reason', 'Risk', 'Compensating controls', 'Owner', 'Expiry date',
          'Council decision', 'Status', 'Closed date', 'Days to expiry', 'Expiry flag', 'Within 90 days']
sheet('Waivers', 'Waiver Register (T15)', w_cols, rows=200,
      example=['WVR-007', 'Delivery Manager', '2026-11-10', 'BUG-DEP-118', 'G7 full regression pack', 'P2 hotfix; targeted tests only', 'Medium', 'Full pack in next scheduled release', 'QA Lead', '2026-12-10', 'Approved with conditions', 'Open', None],
      formulas={'Days to expiry': 'IF(OR(J{r}="",L{r}="Closed"),"",J{r}-TODAY())',
                'Expiry flag': 'IF(N{r}="","",IF(N{r}<0,"EXPIRED",IF(N{r}<=14,"Due soon","OK")))',
                'Within 90 days': 'IF(OR(C{r}="",J{r}=""),"",IF(J{r}-C{r}<=90,"Yes","NO"))'},
      lists={'Risk': ['Low', 'Medium', 'High'], 'Council decision': ['Approved', 'Approved with conditions', 'Rejected'], 'Status': ['Open', 'Closed']},
      date_cols=(2, 9, 12), widths={'Reason': 28, 'Compensating controls': 28, 'Rule or gate waived': 22})

# ---------- CP Versions ----------
cp_cols = ['Version', 'Merge date', 'Files changed', 'T14 references', 'Earliest T14 raised', 'Lead time (working days)', 'Summary', 'Owner approval', 'Council approval', 'Broadcast date']
sheet('CP Versions', 'Context Pack Version Log', cp_cols, rows=100,
      example=['CP v1.3', '2026-11-12', 'CP-10, CP-30', 'CPCR-014, CPCR-015', '2026-11-06', None, 'Idempotency rule for event consumers; transfer-in-period test pattern', 'Architect', 'QA Lead', '2026-11-12'],
      formulas={'Lead time (working days)': 'IF(OR(B{r}="",E{r}=""),"",NETWORKDAYS(E{r},B{r}))'}, date_cols=(1, 4, 9), widths={'Summary': 40})

# ---------- Defect to Gate ----------
dg_cols = ['BUG ID', 'Severity', 'Release found', 'Release introduced', 'Stage of origin', 'Gate that missed it', 'Why it was missed', 'Preventive action', 'Action type', 'Owner', 'Due date', 'T14 / checklist ref', 'Status']
sheet('Defect to Gate', 'Defect to Gate Analysis (from T06)', dg_cols, rows=200,
      example=['BUG-DEP-118', 'P2', 'REL 4.7.0', 'REL 4.6.0', 'S4', 'G6', 'No transfer-within-period case in the suite', 'Add transfer pattern to CP-30; add idempotency rule to CP-10', 'Context Pack', 'QA Lead', '2026-11-20', 'CPCR-014', 'Closed'],
      lists={'Severity': ['P1', 'P2', 'P3', 'P4'], 'Stage of origin': ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'], 'Gate that missed it': ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9'],
             'Action type': ['Test', 'Checklist', 'Context Pack', 'Design', 'Training'], 'Status': ['Open', 'In progress', 'Closed']},
      date_cols=(10,), widths={'Why it was missed': 30, 'Preventive action': 36})

# ---------- Metrics ----------
m = wb.create_sheet('Metrics')
m['A1'] = 'Council Metrics (live)'; m['A1'].font = Font(name=F, bold=True, size=14, color=INK)
m['A2'] = 'Calculated from the other sheets (example rows excluded). Review monthly at the AI Governance Council.'; m['A2'].font = Font(name=F, italic=True, size=9, color=SLATE)
hdr = ['Metric', 'Definition', 'Target', 'Current', 'Status']
for i, h in enumerate(hdr, 1):
    c = m.cell(4, i, h); c.font = Font(name=F, bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor=INK); c.border = BORDER
R6 = 'RTM!R6:R305'
rows = [
    ('RTM completeness', 'Requirements with coverage OK ÷ requirements in scope (excluding retired)', 1, f'IFERROR(COUNTIF({R6},"OK")/(COUNTIF({R6},"OK")+COUNTIF({R6},"GAP")),"")', 'ge', '0.0%'),
    ('Automation parity (latest release)', 'Parity of the last release row on the Parity sheet', 1, 'IFERROR(INDEX(Parity!F6:F105,MATCH(9.99E+307,Parity!F6:F105)),"")', 'eq', '0.0%'),
    ('Gate evidence', 'Gate rows with evidence complete ÷ gate rows', 1, "IFERROR(COUNTIF('Gate Log'!S6:S505,\"Yes\")/COUNTA('Gate Log'!A6:A505),\"\")", 'ge', '0.0%'),
    ('Separation of duties breaches', 'Gate rows where the L3 reviewer is the AI operator', 0, "COUNTIF('Gate Log'!N6:N505,\"NO\")", 'le', '0'),
    ('AI declaration', 'AI usage rows with a T11 reference ÷ AI usage rows', 1, "IFERROR(COUNTIF('AI Usage Log'!N6:N505,\"Yes\")/COUNTA('AI Usage Log'!B6:B505),\"\")", 'ge', '0.0%'),
    ('Unresolved assumptions at gate', 'Sum of assumptions still open when gates were signed', 0, "SUM('AI Usage Log'!K6:K505)", 'le', '0'),
    ('Open waivers', 'Waivers with status Open', None, 'COUNTIF(Waivers!L6:L205,"Open")', None, '0'),
    ('Expired waivers', 'Open waivers past their expiry date', 0, 'COUNTIF(Waivers!O6:O205,"EXPIRED")', 'le', '0'),
    ('Open preventive actions', 'Defect-to-gate actions not yet closed', None, "COUNTIFS('Defect to Gate'!A6:A205,\"<>\",'Defect to Gate'!M6:M205,\"<>Closed\")", None, '0'),
    ('Context Pack lead time', 'Average working days from T14 raised to merge', 5, "IFERROR(AVERAGE('CP Versions'!F6:F105),\"\")", 'le', '0.0'),
]
for k, (name, defn, tgt, f, cmp, fmt) in enumerate(rows, 5):
    m.cell(k, 1, name).font = Font(name=F, bold=True, size=10, color=INK)
    m.cell(k, 2, defn).font = Font(name=F, size=10)
    tc = m.cell(k, 3, tgt if tgt is not None else 'Track'); tc.font = Font(name=F, size=10, color='0000FF'); tc.number_format = fmt if tgt is not None else 'General'
    cc = m.cell(k, 4, '=' + f); cc.number_format = fmt; cc.font = Font(name=F, size=10); cc.fill = PatternFill('solid', fgColor=GREY)
    if cmp:
        op = {'ge': '>=', 'le': '<=', 'eq': '='}[cmp]
        sc = m.cell(k, 5, f'=IF(D{k}="","No data",IF(ROUND(D{k},4){op}C{k},"On target","Action needed"))')
    else:
        sc = m.cell(k, 5, 'Information')
    sc.font = Font(name=F, size=10); sc.fill = PatternFill('solid', fgColor=GREY)
    for i in range(1, 6): m.cell(k, i).border = BORDER; m.cell(k, i).alignment = Alignment(vertical='top', wrap_text=True)
m.cell(16, 1, 'Targets in blue are set by the AI Governance Council (process definition 9.5) and can be changed here.').font = Font(name=F, italic=True, size=9, color=SLATE)
for col, w in zip('ABCDE', [34, 60, 10, 12, 16]): m.column_dimensions[col].width = w
red = PatternFill('solid', fgColor='F3DCDC'); green = PatternFill('solid', fgColor='E3F1E5')
m.conditional_formatting.add('E5:E14', CellIsRule(operator='equal', formula=['"Action needed"'], fill=red))
m.conditional_formatting.add('E5:E14', CellIsRule(operator='equal', formula=['"On target"'], fill=green))
wb['RTM'].conditional_formatting.add('R6:R305', CellIsRule(operator='equal', formula=['"GAP"'], fill=red))
wb['Gate Log'].conditional_formatting.add('N6:N505', CellIsRule(operator='equal', formula=['"NO"'], fill=red))
wb['Gate Log'].conditional_formatting.add('S6:S505', CellIsRule(operator='equal', formula=['"No"'], fill=red))
wb['AI Usage Log'].conditional_formatting.add('N6:N505', CellIsRule(operator='equal', formula=['"Missing"'], fill=red))
wb['Waivers'].conditional_formatting.add('O6:O205', CellIsRule(operator='equal', formula=['"EXPIRED"'], fill=red))
wb['Waivers'].conditional_formatting.add('P6:P205', CellIsRule(operator='equal', formula=['"NO"'], fill=red))
wb['Parity'].conditional_formatting.add('G6:G105', CellIsRule(operator='notEqual', formula=['"Reconciled"'], fill=red))

# example-row dates as real dates
import datetime
for ws_name, cols in [('Gate Log', ['Q']), ('AI Usage Log', ['A']), ('Waivers', ['C', 'J']), ('CP Versions', ['B', 'E', 'J']), ('Defect to Gate', ['K'])]:
    for c in cols:
        cell = wb[ws_name][f'{c}5']
        if isinstance(cell.value, str): cell.value = datetime.date.fromisoformat(cell.value); cell.number_format = 'dd-mmm-yyyy'
wb.save(OUT); print('saved', OUT)
