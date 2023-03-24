import User from '../Models/User.js';

// READ
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        // Trong user trả về từ DB có property friends là 1 array chứa Id của tất cả
        // các friend của user đó
        const friends = await Promise.all(user.friends.map(id => User.findById(id)));

        // Lấy ra những data cần thiết để sử dụng phía FE
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, location, picturePath }) => ({
                _id,
                firstName,
                lastName,
                occupation,
                location,
                picturePath
            })
        );

        res.status(200).json(formattedFriends);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// UPDATE
export const addRemoveFriend = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        if (user.friends.includes(friendId)) {
            user.friends = user.friends.filter(id => id !== friendId);
            friend.friends = friend.friends.filter(id => id !== id);
        } else {
            user.friends.push(friendId);
            friend.friends.push(id);
        }

        const friends = await Promise.all(user.friends.map(id => User.findById(id)));
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, location, picturePath }) => ({
                _id,
                firstName,
                lastName,
                occupation,
                location,
                picturePath
            })
        );

        await user.save();
        await friend.save();

        res.status(200).json(formattedFriends);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
