# -*- coding: utf-8 -*-
from transformers import pipeline

question_answering = pipeline("question-answering", model="mrm8488/bert-multi-cased-finetuned-xquadv1",
  tokenizer="mrm8488/bert-multi-cased-finetuned-xquadv1")

def main():
  question = "私はどこで生まれましたか？"
  context = """
  私は京都の西陣で生まれて育ちました。
  ほぼ30年前に四日市に引っ越しました。
  四日市の大学で教えています。
  教えている科目は、英語とコンピュータと福祉です。
  好きな本は、『カラマーゾフの兄弟』と『歎異抄（たんにしょう）』です。
  カラマーゾフの兄弟を書いたのは、ドストエフスキーです。
  歎異抄を書いたのは唯円だと言われています。
  最近聞く歌は、Sinead O'ConnorとBillie Eilishの歌です。
  趣味は、プログラムを書くことで、PythonとRとJuliaが得意です。
  私の専門は、分析哲学です。特にドイツの哲学者Wittgensteinを研究していました。
  """
 
  result = question_answering(question=question, context=context)
  print("Answer:", result['answer'])
  print("Score:", result['score'])

  question = "私の専門は何ですか？"
  result = question_answering(question=question, context=context)
  print("Answer:", result['answer'])
  print("Score:", result['score'])

if __name__ == "__main__":
    main()