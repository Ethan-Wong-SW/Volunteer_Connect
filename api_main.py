from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util

class VolunteerTagger:
    def __init__(self, mode="zero-shot", top_n=2):
        """
        mode: "zero-shot" or "embeddings"
        top_n: number of top tags per category to return
        """
        self.mode = mode
        self.top_n = top_n

        # --- Define Tag Categories ---
        self.tag_categories = {
            "interests": [
                "Childcare",
                "Event Support",
                "Community Engagement",
                "Administrative Work",
                "Education",
                "Environmental Work",
                "Healthcare",
                "Animal Welfare", "Arts", 
                "Digital", 
                "Drug Awareness", 
                "Eldercare", 
                "Families", 
                "Health", 
                "Heritage", 
                "Humanitarian", 
                "Mental Health", 
                "Migrant Workers", 
                "Rehabilitation and Reintegration",
                "Social Services",
                "Special Needs", 
                "Sports", 
                "Youth",
            ],
            "skills": [
                "Communication",
                "Teamwork",
                "Empathy",
                "Leadership",
                "Crowd Management",
                "Creativity",
                "Organizing",
                "Outdoor work",
                "Mentoring",
                "Pet Care"
            ]
        }

        # --- Initialize Models ---
        if mode == "zero-shot":
            print("🔹 Loading Zero-Shot Classification model...")
            self.classifier = pipeline(
                "zero-shot-classification", 
                model="facebook/bart-large-mnli"
            )
        elif mode == "embeddings":
            print("🔹 Loading Embedding model...")
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            # Precompute embeddings for all tags
            self.tag_embeddings = {
                cat: self.model.encode(tags, convert_to_tensor=True)
                for cat, tags in self.tag_categories.items()
            }
        else:
            raise ValueError("Invalid mode: choose 'zero-shot' or 'embeddings'")

    def predict(self, description):
        """
        Returns a dictionary of {category: [top_tags]}
        """
        results = {}
        for category, tags in self.tag_categories.items():
            if self.mode == "zero-shot":
                scores = self._predict_zero_shot(description, tags)
            else:
                scores = self._predict_embeddings(description, category, tags)

            # Sort by score descending, pick top_n
            sorted_tags = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            results[category] = [tag for tag, _ in sorted_tags[:self.top_n]]
        return results

    def _predict_zero_shot(self, description, candidate_tags):
        result = self.classifier(description, candidate_tags, multi_label=True)
        return dict(zip(result["labels"], result["scores"]))

    def _predict_embeddings(self, description, category, candidate_tags):
        desc_emb = self.model.encode(description, convert_to_tensor=True)
        cosine_scores = util.cos_sim(desc_emb, self.tag_embeddings[category])[0]
        return dict(zip(candidate_tags, cosine_scores.tolist()))

# 1. Initialize the FastAPI app
app = FastAPI()

# 2. Load your model *once* when the server starts
#    This is crucial for performance.
tagger = VolunteerTagger(mode="zero-shot")

# 3. Define what data your API will expect (a simple text description)
class Item(BaseModel):
    description: str

# 4. Create the API endpoint
@app.post("/get-tags")
async def get_tags_from_text(item: Item):
    """
    Receives a block of text and returns the AI-generated tags.
    """
    tags = tagger.predict(item.description)
    return {"tags": tags}