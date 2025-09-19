#!/bin/bash

# Script de téléchargement des images thématiques pour L'Île aux Oiseaux
# Nommage organisé par catégories

BASE_PATH="/Users/ptn/dev/projects/ileauxoiseaux"

echo "Téléchargement des images thématiques pour L'Île aux Oiseaux..."

# Créer tous les dossiers nécessaires
mkdir -p "$BASE_PATH/assets/img/hero"
mkdir -p "$BASE_PATH/assets/img/activities"
mkdir -p "$BASE_PATH/assets/img/team" 
mkdir -p "$BASE_PATH/assets/img/spaces"
mkdir -p "$BASE_PATH/assets/img/meals"
mkdir -p "$BASE_PATH/assets/img/programs"

# Fonction de téléchargement avec vraies photos
download_photo() {
    local width="$1"
    local height="$2" 
    local seed="$3"
    local output_file="$4"
    local description="$5"
    
    local url="https://picsum.photos/seed/${seed}/${width}/${height}.jpg"
    local full_path="$BASE_PATH/assets/img/$output_file"
    
    echo "📸 $description"
    
    if curl -s -L -o "$full_path" "$url"; then
        if [ -f "$full_path" ] && [ -s "$full_path" ]; then
            echo "✓ $(basename "$full_path") - $(du -h "$full_path" | cut -f1)"
        else
            echo "✗ Échec"
        fi
    else
        echo "✗ Téléchargement échoué"
    fi
    echo ""
}

echo ""
echo "=== 🦜 HERO & IMAGES PRINCIPALES ==="

download_photo 1200 800 "happy-children-learning" \
    "hero/hero-main.jpg" \
    "Image principale - Enfants heureux en apprentissage"

download_photo 1200 630 "school-facade" \
    "hero/og-image.jpg" \
    "Image Open Graph / Réseaux sociaux"

echo ""
echo "=== 🎨 ACTIVITÉS (12 images) ==="

download_photo 800 600 "art-painting-kids" \
    "activities/activity-01.jpg" \
    "Activité 01 - Atelier peinture et arts créatifs"

download_photo 800 600 "outdoor-playground" \
    "activities/activity-02.jpg" \
    "Activité 02 - Jeux extérieurs dans le jardin"

download_photo 800 600 "reading-story-time" \
    "activities/activity-03.jpg" \
    "Activité 03 - Lecture et moments calmes"

download_photo 800 600 "music-dance-kids" \
    "activities/activity-04.jpg" \
    "Activité 04 - Éveil musical et danse"

download_photo 800 600 "science-discovery" \
    "activities/activity-05.jpg" \
    "Activité 05 - Découverte et expériences"

download_photo 800 600 "motor-skills-play" \
    "activities/activity-06.jpg" \
    "Activité 06 - Développement moteur"

download_photo 800 600 "cooking-workshop" \
    "activities/activity-07.jpg" \
    "Activité 07 - Ateliers cuisine créatifs"

download_photo 800 600 "gardening-nature" \
    "activities/activity-08.jpg" \
    "Activité 08 - Jardinage pédagogique"

download_photo 800 600 "building-blocks" \
    "activities/activity-09.jpg" \
    "Activité 09 - Jeux de construction"

download_photo 800 600 "water-sensory-play" \
    "activities/activity-10.jpg" \
    "Activité 10 - Jeux d'eau et sensoriels"

download_photo 800 600 "group-collaboration" \
    "activities/activity-11.jpg" \
    "Activité 11 - Travail en groupe"

download_photo 800 600 "cultural-diversity" \
    "activities/activity-12.jpg" \
    "Activité 12 - Découverte culturelle"

echo ""
echo "=== 👥 ÉQUIPE (8 portraits) ==="

download_photo 500 500 "director-woman-professional" \
    "team/team-01.jpg" \
    "Équipe 01 - Directrice"

download_photo 500 500 "teacher-woman-young" \
    "team/team-02.jpg" \
    "Équipe 02 - Éducatrice principale"

download_photo 500 500 "teacher-man-kind" \
    "team/team-03.jpg" \
    "Équipe 03 - Éducateur spécialisé"

download_photo 500 500 "assistant-woman-smiling" \
    "team/team-04.jpg" \
    "Équipe 04 - Assistante pédagogique"

download_photo 500 500 "nurse-healthcare-woman" \
    "team/team-05.jpg" \
    "Équipe 05 - Auxiliaire de puériculture"

download_photo 500 500 "cook-chef-uniform" \
    "team/team-06.jpg" \
    "Équipe 06 - Chef cuisinier"

download_photo 500 500 "maintenance-man-friendly" \
    "team/team-07.jpg" \
    "Équipe 07 - Agent d'entretien"

download_photo 500 500 "secretary-woman-office" \
    "team/team-08.jpg" \
    "Équipe 08 - Secrétaire d'accueil"

echo ""
echo "=== 🏠 ESPACES (10 images) ==="

download_photo 800 600 "classroom-bright-colorful" \
    "spaces/space-01.jpg" \
    "Espace 01 - Salle de classe lumineuse"

download_photo 800 600 "nursery-baby-room" \
    "spaces/space-02.jpg" \
    "Espace 02 - Section des nourrissons"

download_photo 800 600 "nap-room-quiet" \
    "spaces/space-03.jpg" \
    "Espace 03 - Salle de repos et sieste"

download_photo 800 600 "dining-room-tables" \
    "spaces/space-04.jpg" \
    "Espace 04 - Réfectoire et salle à manger"

download_photo 800 600 "playground-outdoor-safe" \
    "spaces/space-05.jpg" \
    "Espace 05 - Cour de récréation sécurisée"

download_photo 800 600 "library-reading-corner" \
    "spaces/space-06.jpg" \
    "Espace 06 - Coin bibliothèque"

download_photo 800 600 "art-studio-creative" \
    "spaces/space-07.jpg" \
    "Espace 07 - Atelier créatif"

download_photo 800 600 "garden-vegetable-plants" \
    "spaces/space-08.jpg" \
    "Espace 08 - Jardin pédagogique"

download_photo 800 600 "entrance-welcome-bright" \
    "spaces/space-09.jpg" \
    "Espace 09 - Hall d'accueil"

download_photo 800 600 "bathroom-child-adapted" \
    "spaces/space-10.jpg" \
    "Espace 10 - Sanitaires adaptés"

echo ""
echo "=== 🍽️ RESTAURATION (6 images) ==="

download_photo 800 600 "healthy-colorful-meal" \
    "meals/meal-01.jpg" \
    "Repas 01 - Déjeuner équilibré et coloré"

download_photo 800 600 "breakfast-nutritious" \
    "meals/meal-02.jpg" \
    "Repas 02 - Petit-déjeuner nutritif"

download_photo 800 600 "snack-fruits-healthy" \
    "meals/meal-03.jpg" \
    "Repas 03 - Collation fruits et goûter sain"

download_photo 800 600 "children-eating-together" \
    "meals/meal-04.jpg" \
    "Repas 04 - Enfants mangeant ensemble"

download_photo 800 600 "kitchen-clean-professional" \
    "meals/meal-05.jpg" \
    "Repas 05 - Cuisine professionnelle"

download_photo 800 600 "local-fresh-ingredients" \
    "meals/meal-06.jpg" \
    "Repas 06 - Ingrédients frais et locaux"

echo ""
echo "=== 📚 PROGRAMMES PAR ÂGE (6 images) ==="

download_photo 800 600 "baby-sensory-development" \
    "programs/program-01.jpg" \
    "Programme 01 - Éveil sensoriel (2-12 mois)"

download_photo 800 600 "toddler-motor-skills" \
    "programs/program-02.jpg" \
    "Programme 02 - Développement moteur (1-2 ans)"

download_photo 800 600 "toddler-social-play" \
    "programs/program-03.jpg" \
    "Programme 03 - Socialisation (2-3 ans)"

download_photo 800 600 "preschool-learning-prep" \
    "programs/program-04.jpg" \
    "Programme 04 - Préparation scolaire (3-4 ans)"

download_photo 800 600 "preschool-advanced-skills" \
    "programs/program-05.jpg" \
    "Programme 05 - Compétences avancées (4-5 ans)"

download_photo 800 600 "holiday-program-fun" \
    "programs/program-06.jpg" \
    "Programme 06 - Activités vacances"

echo ""
echo "=== 📊 RÉSUMÉ ==="
echo "Images téléchargées par catégorie :"
echo "• Hero/Principales : 2 images"
echo "• Activités : 12 images" 
echo "• Équipe : 8 portraits"
echo "• Espaces : 10 images"
echo "• Restauration : 6 images"
echo "• Programmes : 6 images"
echo ""
echo "TOTAL : 44 images professionnelles"

echo ""
echo "Vérification des téléchargements :"
find "$BASE_PATH/assets/img" -name "*.jpg" | wc -l | xargs echo "Fichiers JPG trouvés :"

echo ""
echo "Taille totale des images :"
du -sh "$BASE_PATH/assets/img" | cut -f1 | xargs echo "Espace disque utilisé :"

echo ""
echo "✅ Téléchargement terminé !"
echo ""
echo "🚀 Pour lancer l'application :"
echo "cd $BASE_PATH"
echo "python -m http.server 8000"
echo "Puis ouvrir : http://localhost:8000"

echo ""
echo "📝 PROCHAINE ÉTAPE :"
echo "Modifier le HTML pour utiliser ces images au lieu des émojis"
echo "• Remplacer les 🎨 par <img src=\"assets/img/activities/activity-01.jpg\">"
echo "• Ajouter des galeries photos"
echo "• Créer les pages équipe et galerie complètes"