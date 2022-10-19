import torch
from pyknp import Juman
from transformers import AutoTokenizer, AutoModelForMaskedLM

jumanpp = Juman()
tokenizer = AutoTokenizer.from_pretrained("nlp-waseda/roberta-large-japanese-seq512")
model = AutoModelForMaskedLM.from_pretrained("nlp-waseda/roberta-large-japanese-seq512")

def get_masked_index(encoding):
  for idx, id in enumerate(encoding.input_ids.squeeze(0)):
      if id == tokenizer.mask_token_id:
          return idx

def get_segmented_text(text):
  result = jumanpp.analysis(text)
  return ' '.join(mrph.midasi for mrph in result)

segmented_text = get_segmented_text("早稲田大学で自然言語処理を[MASK]する。")
print(segmented_text)

sentence = '早稲田 大学 で 自然 言語 処理 を [MASK] する 。' # input should be segmented into words by Juman++ in advance
encoding = tokenizer(sentence, return_tensors='pt')

# 予測
pred = model(**encoding)

# 後処理(取得した予測分布から、maskトークンの上位k件の予測結果を取得)
masked_idx = get_masked_index(encoding)
target_probs = pred.logits.squeeze(0)[masked_idx]

# 上位k件の予測結果をのindexを取得
top_k = torch.topk(target_probs, k=5).indices
for id in top_k:
    print(sentence.replace("[MASK]", f"'{tokenizer.decode(id)}'"))