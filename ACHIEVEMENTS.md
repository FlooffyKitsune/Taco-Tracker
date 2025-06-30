# Adding New Achievements 🏆

This guide explains how to add new achievements to the Taco Tracker app. Achievements are stored in the database and display in a Steam-like interface showing both locked and unlocked achievements.

## Quick Steps

1. **Add achievement to `src/lib/achievements.ts`**
2. **Run the seed endpoint to update database**
3. **Test in the app**

## Achievement Structure

Each achievement needs these fields:

```typescript
{
  name: 'Achievement Name',           // Unique name
  description: 'What the user did',  // Description shown to users  
  icon: '🏆',                        // Emoji icon (shows in both locked/unlocked)
  category: 'consumption',           // Category for grouping
  requirement: 100                   // Points awarded
}
```

## Categories

Use these predefined categories for consistent grouping:

- **`consumption`** - Eating tacos, total counts (🍽️)
- **`social`** - Multi-user sessions, collaboration (👥) 
- **`streak`** - Daily/weekly patterns, consistency (📅)
- **`special`** - Hidden/Easter egg achievements (⭐)

## Adding Your Achievement

### 1. Edit the achievements file

Add your achievement to `src/lib/achievements.ts` in the `DEFAULT_ACHIEVEMENTS` array:

```typescript
{
  name: 'Midnight Munchies',
  description: 'Track tacos after 11 PM',
  icon: '🌙',
  category: 'special',
  requirement: 50
}
```

### 2. Update the database

Run the seed endpoint to add new achievements:

```bash
# Via browser: visit http://localhost:5173/api/seed
# Or via terminal:
curl http://localhost:5173/api/seed
```

### 3. Achievement Logic (Optional)

If your achievement needs custom unlock logic beyond what's already implemented, you may need to update:

- `src/lib/achievements.ts` - `checkAndUnlockAchievements()` function
- `src/lib/userService.ts` - Achievement checking in consumption tracking

## Ideas for New Achievements

Here are some achievement ideas you could implement:

### Consumption Achievements
- **"Speed Demon"** - Eat 5 tacos in under 1 hour
- **"Carnivore"** - Eat 10 meat-based tacos
- **"Herbivore"** - Eat 10 vegetarian tacos
- **"Pescetarian"** - Eat 10 fish/seafood tacos

### Social Achievements  
- **"Party Planner"** - Create 5 taco sessions
- **"Team Player"** - Join 10 different sessions
- **"Crowd Pleaser"** - Create a session with 10+ people

### Streak Achievements
- **"Weekly Warrior"** - Track tacos 7 days in a row
- **"Monthly Master"** - Track tacos for 30 days
- **"Lunch Break Legend"** - Track tacos between 11 AM - 2 PM for 5 days

### Special/Hidden Achievements
- **"Perfectionist"** - Complete a session where everyone claims exactly their ordered amount
- **"Lucky 7"** - Complete 7 sessions with exactly 7 tacos each
- **"Taco Tuesday"** - Track tacos every Tuesday for a month
- **"Night Owl"** - Track 10 tacos after midnight

## Testing Your Achievement

1. **Visual Test**: Check that it appears in the locked achievements list
2. **Unlock Test**: If possible, trigger the unlock condition to see it move to unlocked
3. **Points Test**: Verify the points are awarded correctly

## Pull Request Guidelines

When submitting new achievements:

1. **Follow the naming convention**: Clear, fun, descriptive names
2. **Use appropriate emojis**: Should be relevant and visually appealing  
3. **Include examples**: Show how to unlock the achievement
4. **Test thoroughly**: Make sure it doesn't break existing functionality
5. **Document special logic**: If you add custom unlock conditions, explain them

## Example Pull Request

```markdown
# Add "Speed Demon" Achievement

- **Name**: Speed Demon  
- **Description**: Eat 5 tacos in under 1 hour
- **Icon**: ⚡
- **Category**: special
- **Points**: 75

**How to unlock**: Track 5 or more tacos with timestamps within a 1-hour window.

**Implementation notes**: Added logic to check consumption timestamps in the unlock checker.
```

---

Happy achievement hunting! 🌮🏆
