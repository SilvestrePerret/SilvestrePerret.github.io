import { env, Sam2Model, AutoProcessor, RawImage, Tensor } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';

// Skip local model check since we download from Hugging Face Hub
env.allowLocalModels = false;

// State variables
let model = null;
let processor = null;
let image_embeddings = null;
let image_inputs = null;

// Model configuration
const MODEL_ID = 'onnx-community/sam2.1-hiera-tiny-ONNX';

self.onmessage = async (e) => {
    const { type, data } = e.data;

    if (type === 'load') {
        // Load the model and processor
        try {
            self.postMessage({ type: 'loading', data: 'Downloading model...' });

            const device = data.useWebGPU ? 'webgpu' : undefined;

            // Load model and processor in parallel
            const [loadedModel, loadedProcessor] = await Promise.all([
                Sam2Model.from_pretrained(MODEL_ID, {
                    dtype: 'fp16',
                    ...(device && { device }),
                }),
                AutoProcessor.from_pretrained(MODEL_ID),
            ]);

            model = loadedModel;
            processor = loadedProcessor;

            self.postMessage({ type: 'ready' });
        } catch (error) {
            self.postMessage({ type: 'error', data: error.message });
        }

    } else if (type === 'reset') {
        image_inputs = null;
        image_embeddings = null;

    } else if (type === 'segment') {
        if (!model || !processor) {
            self.postMessage({ type: 'error', data: 'Model not loaded' });
            return;
        }

        try {
            self.postMessage({ type: 'segment_result', data: 'start' });

            // Read the image and compute embeddings
            const image = await RawImage.read(data);
            image_inputs = await processor(image);
            image_embeddings = await model.get_image_embeddings(image_inputs);

            self.postMessage({ type: 'segment_result', data: 'done' });
        } catch (error) {
            self.postMessage({ type: 'error', data: error.message });
        }

    } else if (type === 'decode') {
        if (!model || !processor || !image_embeddings || !image_inputs) {
            self.postMessage({ type: 'error', data: 'No image encoded yet' });
            return;
        }

        try {
            // Prepare inputs for decoding
            const reshaped = image_inputs.reshaped_input_sizes[0];
            const points = data.map(x => [x.point[0] * reshaped[1], x.point[1] * reshaped[0]]);
            const labels = data.map(x => BigInt(x.label));

            const input_points = new Tensor(
                'float32',
                points.flat(Infinity),
                [1, 1, points.length, 2],
            );
            const input_labels = new Tensor(
                'int64',
                labels.flat(Infinity),
                [1, 1, labels.length],
            );

            // Generate the mask
            const outputs = await model({
                ...image_embeddings,
                input_points,
                input_labels,
            });

            // Post-process the mask
            const masks = await processor.post_process_masks(
                outputs.pred_masks,
                image_inputs.original_sizes,
                image_inputs.reshaped_input_sizes,
            );

            self.postMessage({
                type: 'decode_result',
                data: {
                    mask: RawImage.fromTensor(masks[0][0]),
                    scores: outputs.iou_scores.data,
                },
            });
        } catch (error) {
            self.postMessage({ type: 'error', data: error.message });
        }
    }
};
