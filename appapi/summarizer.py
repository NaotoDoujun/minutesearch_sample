# -*- coding: utf-8 -*-
import nltk
import langid
import spacy
from enum import Enum
from spacy_download import load_spacy
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.kl import KLSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import config

class AlgorithmName(str, Enum):
    lex = "lex"
    lsa = "lsa"
    kls = "kls"

class SUMYSummarizer():

    LANG_JAPANESE = 'japanese'
    LANG_ENGLISH = 'english'

    def __init__(self, logger):
        nltk.download('punkt')
        self.logger = logger
        self.nlp = load_spacy(config.SPACY_EN_MODEL)
        self.ja_nlp = spacy.load(config.GINZA_MODEL)

    def lang_detection(self, text):
        lang, conf = langid.classify(text)
        if lang == 'ja':
            return self.LANG_JAPANESE
        else:
            return self.LANG_ENGLISH

    def get_summarizer(self, algorithm, language):
        summarizer = None
        summarizer_algorithm = ''
        try:
            if algorithm == None:
                raise TypeError("algorithm argument is not a string. Supported algorithms are 'lex', 'lsa', and 'kls'.")
            stemmer = Stemmer(language)
            if algorithm == AlgorithmName.lex:
                summarizer_algorithm = 'LexRank(lex)'
                summarizer = LexRankSummarizer(stemmer)
            elif algorithm ==  AlgorithmName.lsa:
                summarizer_algorithm = 'Latent Semantic Analysis(lsa)'
                summarizer = LsaSummarizer(stemmer)
            elif algorithm == AlgorithmName.kls:
                summarizer_algorithm = 'KL-Sum(kls)'
                summarizer = KLSummarizer(stemmer)

            if summarizer == None:
                raise ValueError("algorithm '{}' not found. Supported algorithms are 'lex', 'lsa', and 'kls'.".format(algorithm))
            
            summarizer.stop_words = get_stop_words(language)
            return summarizer, summarizer_algorithm
        except:
            raise

    def create_corpus(self, text, language):
        corpus = []
        originals = []
        doc = None
        if language == self.LANG_JAPANESE:
            doc = self.ja_nlp(text)
        else:
            doc = self.nlp(text)
        for s in doc.sents:
            originals.append(s)
            tokens = []
            for t in s:
                tokens.append(t.lemma_)
            corpus.append(' '.join(tokens))
        return corpus, originals

    def get_ents(self, text, language):
        ents = []
        doc = None
        if language == self.LANG_JAPANESE:
            doc = self.ja_nlp(text)
        else:
            doc = self.nlp(text)
        for ent in doc.ents:
            ents.append({"label": ent.label_, "text": ent.text})
        return ents

    def summarize(self, text, algorithm):
        try:
            language = self.lang_detection(text)
            corpus, originals = self.create_corpus(text.replace('\r','').replace('\n','').replace('『','「').replace('』','」'), language)
            parser = PlaintextParser.from_string(''.join(corpus), Tokenizer(language))
            summarizer, summarizer_algorithm = self.get_summarizer(algorithm, language)           
            
            res = []
            for sentence in summarizer(document=parser.document, sentences_count=3):
                if language == self.LANG_JAPANESE:
                    if sentence.__str__() in corpus:
                        res.append(originals[corpus.index(sentence.__str__())])
                else:
                    res.append(sentence.__str__())

            summary = '\n'.join([str(x) for x in res])
            summary_ents = self.get_ents(summary, language)
            return {"language": language, "algorithm": summarizer_algorithm, "summary": summary, "summary_ents": summary_ents}
        except:
            raise