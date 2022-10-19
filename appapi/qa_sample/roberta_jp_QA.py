import torch
from transformers import AutoModelForQuestionAnswering, AutoTokenizer

model = AutoModelForQuestionAnswering.from_pretrained('ybelkada/japanese-roberta-question-answering')
tokenizer = AutoTokenizer.from_pretrained('ybelkada/japanese-roberta-question-answering')

def main():
    #question = 'アレクサンダー・グラハム・ベルは、どこで生まれたの?'
    question = "私はどこで生まれましたか？"
    #context = 'アレクサンダー・グラハム・ベルは、スコットランド生まれの科学者、発明家、工学者である。世界初の>実用的電話の発明で知られている。'
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

    inputs = tokenizer(question, context, add_special_tokens=True, return_tensors="pt")
    input_ids = inputs["input_ids"].tolist()[0]
    outputs = model(**inputs)
    answer_start_scores = outputs.start_logits
    answer_end_scores = outputs.end_logits
    answer_start = torch.argmax(answer_start_scores)
    answer_end = torch.argmax(answer_end_scores) + 1
    answer = tokenizer.convert_tokens_to_string(
        tokenizer.convert_ids_to_tokens(input_ids[answer_start:answer_end]))
    print(answer)

if __name__ == "__main__":
    main()