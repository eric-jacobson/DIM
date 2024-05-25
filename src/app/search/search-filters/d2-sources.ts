import { D2CalculatedSeason, D2SeasonInfo } from 'data/d2/d2-season-info';
import D2Sources from 'data/d2/source-info-v2';
const currentSeason = D2SeasonInfo[D2CalculatedSeason].season;

// Fill in extra entries for the aliased source names
for (const sourceAttrs of Object.values(D2Sources)) {
  if (sourceAttrs.aliases) {
    for (const alias of sourceAttrs.aliases) {
      D2Sources[alias] = sourceAttrs;
    }
  }
}

// Generate DCV source
for (const sourceAttrs of Object.values(D2Sources)) {
  if (sourceAttrs.enteredDCV && sourceAttrs.enteredDCV <= currentSeason) {
    if (D2Sources.dcv) {
      if (D2Sources.dcv.itemHashes && sourceAttrs.itemHashes) {
        D2Sources.dcv.itemHashes.push(...sourceAttrs.itemHashes);
      }
      if (D2Sources.dcv.sourceHashes && sourceAttrs.sourceHashes) {
        D2Sources.dcv.sourceHashes.push(...sourceAttrs.sourceHashes);
      }
    } else {
      D2Sources.dcv = sourceAttrs;
    }
  }
}

export default D2Sources;
