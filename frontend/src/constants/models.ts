import { SelectItem } from '@mantine/core';

export const MoldelSelections: SelectItem[] = [
  { value: 'ckpt', label: 'Checkpoint' },
  { value: 'hypernet', label: 'Hypernetwork' },
  { value: 'texture', label: 'Texture Inversion' },
  { value: 'lora', label: 'LoRA' },
  { value: 'locon', label: 'LyCORIS' },
  { value: 'vae', label: 'VAE' },
  { value: 'controlnet', label: 'Controlnet' },
  { value: 'upscaler', label: 'Upscaler Models' }
];
