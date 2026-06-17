import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import ImageUploader from '@site/src/components/ImageUploader';
import { ImageGallery } from '@site/src/components/ImageUploader';
import DiagnosticBooster from '@site/src/components/DiagnosticBooster';
import TreatmentBooster from '@site/src/components/TreatmentBooster';
import EchoBooster from '@site/src/components/EchoBooster';
import MermaidChart from '@site/src/components/MermaidChart';
import DupixentCalculator from '@site/src/components/ClinicalCalc/DupixentCalculator';

export default {
  ...MDXComponents,
  ImageUploader,
  ImageGallery,
  DiagnosticBooster,
  TreatmentBooster,
  EchoBooster,
  MermaidChart,
  DupixentCalculator,
};
