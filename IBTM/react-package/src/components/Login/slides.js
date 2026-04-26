// src/components/Login/slides.js
// Configure aqui os slides do carrossel.
// Cada slide tem um className (que casa com .slide-1..4 no CSS),
// um eyebrow (texto pequeno acima), um title (com <em> opcional para italic)
// e um meta (descrição).
import React from 'react';

export const SLIDES = [
  {
    cls: 'slide-1',
    eyebrow: 'Bem-vindo',
    title: <>Toda boa <em>dádiva</em><br/>vem do alto.</>,
    meta: 'Tiago 1:17 — A força da nossa comunidade está em servir uns aos outros com alegria.',
  },
  {
    cls: 'slide-2',
    eyebrow: 'Quartas, 19h30',
    title: <>Estudo <em>bíblico</em><br/>de quarta-feira.</>,
    meta: 'Encontros semanais para aprofundar a Palavra, com momentos de oração e comunhão entre irmãos.',
  },
  {
    cls: 'slide-3',
    eyebrow: 'Acampadentro 2026',
    title: <>Três dias para <em>respirar</em><br/>na presença d&rsquo;Ele.</>,
    meta: 'Inscrições abertas para o retiro anual da família IBTM. Programação completa em breve.',
  },
  {
    cls: 'slide-4',
    eyebrow: 'Domingo · Culto da Família',
    title: <>Um lugar onde <em>cabe</em><br/>a sua história.</>,
    meta: 'Cultos às 9h, 11h e 19h. Ministério infantil, jovens e família — para todas as idades.',
  },
];

export const DEFAULT_VERSE = '“O Senhor é o meu pastor, nada me faltará.”';
export const DEFAULT_VERSE_REF = 'Salmo 23:1';
