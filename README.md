# ChatWords
![](https://img.shields.io/badge/WordsGPT-ChatWords-blue)
![License](https://img.shields.io/github/license/WordsGPT/ChatWords)
![](https://img.shields.io/badge/Open%20Source-Yes-green)

<!--
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2FWordsGPT%2FChatWords%2Fraw%2Fmain%2Fbackend%2Fpackage.json&query=%24.engines.node&label=Node.js)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2FWordsGPT%2FChatWords%2Fraw%2Fmain%2Fbackend%2Fpackage.json&query=%24.engines.npm&label=npm&)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/WordsGPT/ChatWords/development)
-->

This repository contains the source code for **ChatWords**, an application to evaluate the lexical knowledge of Artificial Intelligence tools, that is described in the paper:
_“ChatWords: Automating ChatGPT Lexical Knowledge Evaluation”_

## Description

ChatWords takes as input a list of words and performs a series of questions to the AI model being evaluated to gather information on its knowledge of each word. The questions and parameters of the AI model can be selected by the user. 

For example, we can select ChatGPT3.5 as a model, set its temperature value to 0.8, and configure these two questions:

- _"Do you know the meaning of the word "X" in Spanish? Please answer yes or no."_
- _"Is "X" a correct word in Spanish? Please answer, yes or no."_

With two input words:
- _“Rocambolesco”_
- _“Rompenecios”_
  
ChatWords queries ChatGPT using OpenAI’s API and stores the responses in a database for further processing. ChatWords can be accessed using a Web interface.

## Installation

## Extending ChatWords (Developer Guide)





